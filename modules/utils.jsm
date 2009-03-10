/*
 * Copyright 2008 by Massimiliano Mirra
 *
 * This file is part of xmpp4moz.
 *
 * xmpp4moz is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the
 * Free Software Foundation; either version 3 of the License, or (at your
 * option) any later version.
 *
 * xmpp4moz is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Massimiliano Mirra, <bard [at] hyperstruct [dot] net>
 *
 */


// EXPORTS
// ----------------------------------------------------------------------

var EXPORTED_SYMBOLS = [
    'JID',
    'URI',
    'entity',
    'getPassword',
    'setPassword',
    'delPassword',
    'asDOM',
    'asXML',
    'asString',
    'serialize'
];


// DEFINITIONS
// ----------------------------------------------------------------------

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;

var parser = Cc['@mozilla.org/xmlextras/domparser;1']
    .getService(Ci.nsIDOMParser);
var serializer = Cc['@mozilla.org/xmlextras/xmlserializer;1']
    .getService(Ci.nsIDOMSerializer);


// ----------------------------------------------------------------------

function entity(identifier) {
    return ((identifier instanceof Ci.nsIURI || identifier.match(/^xmpp:/)) ?
            URI(identifier) : JID(identifier))
}

function JID(string) {
    var memo = arguments.callee.memo || (arguments.callee.memo = { __proto__: null });
    if(string in memo)
        return memo[string];
    var m = string.match(/^(.+?@)?(.+?)(?:\/|$)(.*$)/);

    if(!m)
        throw new Error('Malformed JID. (' + string + ')');

    var jid = {};

    if(m[1])
        jid.username = m[1].slice(0, -1);

    jid.hostname = m[2];
    jid.resource = m[3];
    jid.nick     = m[3];
    jid.full     = m[3] ? string : null;
    jid.address  = jid.username ?
        jid.username + '@' + jid.hostname :
        jid.hostname;

    memo[string] = jid;
    return jid;
}

function URI(uriRepresentation) {
    var memoKey = (uriRepresentation instanceof Ci.nsIURI ?
                   uriRepresentation.spec : uriRepresentation);
    var memo = arguments.callee.memo || (arguments.callee.memo = { __proto__: null });
    if(memoKey in memo)
        return memo[memoKey];

    var sourceUri;
    if(uriRepresentation instanceof Ci.nsIURI)
        sourceUri = uriRepresentation;
    else if(typeof(uriRepresentation == 'string')) {
        sourceUri = Cc['@mozilla.org/network/standard-url;1']
            .createInstance(Ci.nsIStandardURL);

        var type;
        if(uriRepresentation.match(/^xmpp:\/{3}/) ||
           uriRepresentation.match(/^xmpp:[^\/]/))
            type = Ci.nsIStandardURL.URLTYPE_NO_AUTHORITY;
        else if(uriRepresentation.match(/^xmpp:\/\/[^\/]/))
            type = Ci.nsIStandardURL.URLTYPE_AUTHORITY;
        else
            throw new Error('Malformed URL'); // XXX should probably throw nsIException

        sourceUri.init(type, 5222, uriRepresentation, null, null);
        sourceUri.QueryInterface(Ci.nsIURI);
    } else
        throw new Error('Unrecognized URI representation. (' + uriRepresentation + ')');

    var m = sourceUri.path.match(/(.+?)\?(.+)$/);
    var path, query;
    if(m) {
        path = m[1];
        query = m[2];
    } else {
        path = sourceUri.path;
    }

    var uri = {
        account: (sourceUri.username && sourceUri.host) ?
            sourceUri.username + '@' + sourceUri.host : undefined,
        address: path.replace(/^\//, ''),
        action: query
    }

    memo[memoKey] = uri;
    return uri;
}

function getPassword(address) {
    var url = 'xmpp://' + JID(address).hostname;
    var username = JID(address).username;

    if('@mozilla.org/passwordmanager;1' in Cc) {
        var passwordManager = Cc['@mozilla.org/passwordmanager;1']
            .getService(Ci.nsIPasswordManager);

        var e = passwordManager.enumerator;
        while(e.hasMoreElements()) {
            try {
                var pass = e.getNext().QueryInterface(Ci.nsIPassword);
                if(pass.host == url && pass.user == username)
                    return pass.password;
            } catch (ex) {

            }
        }

    } else if('@mozilla.org/login-manager;1' in Cc) {
        var loginInfo = getLoginInfo(url, username);
        if(loginInfo)
            return loginInfo.password;
    }
}

function delPassword(address) {
    var url = 'xmpp://' + JID(address).hostname;
    var username = JID(address).username;

    if('@mozilla.org/passwordmanager;1' in Cc) {
        var passwordManager = Cc['@mozilla.org/passwordmanager;1']
            .getService(Ci.nsIPasswordManager);

        try { passwordManager.removeUser(url, username); } catch (e) {}
    } else if('@mozilla.org/login-manager;1' in Cc) {
        var loginInfo = getLoginInfo(url, username);
        if(loginInfo)
            loginManager.removeLogin(loginInfo)
    }
}

function setPassword(address, password) {
    var url = 'xmpp://' + JID(address).hostname;
    var username = JID(address).username;

    if('@mozilla.org/passwordmanager;1' in Cc) {
        var passwordManager = Cc['@mozilla.org/passwordmanager;1']
            .getService(Ci.nsIPasswordManager);

        try { passwordManager.removeUser(url, username); } catch (e) {}
        passwordManager.addUser(url, username, password);
    }
    else if('@mozilla.org/login-manager;1' in Cc) {
        var loginManager = Cc['@mozilla.org/login-manager;1']
            .getService(Ci.nsILoginManager)

        var loginInfo = Cc['@mozilla.org/login-manager/loginInfo;1']
            .createInstance(Ci.nsILoginInfo);
        loginInfo.init(
            url,                        // hostname
            null,                       // submit url - forms only
            url,                        // realm - it's important that this be same as url, as firefox2->3 migration will make it so for accounts in firefox2
            username,                   // username
            password,                   // password
            '',                       // username field - forms only
            '');                      // password field - forms only

        var oldLoginInfo = getLoginInfo(url, username);

        if(oldLoginInfo)
            loginManager.modifyLogin(oldLoginInfo, loginInfo)
        else
            loginManager.addLogin(loginInfo);
    }
}

function asXML(element) {
    return new XML(serialize(element));
}

function asDOM(object) {
    if(object instanceof Ci.nsIDOMElement)
        return object;

    var element;
    switch(typeof(object)) {
    case 'xml':
        element = parser
            .parseFromString(object.toXMLString(), 'text/xml')
            .documentElement;
        break;
    case 'string':
        element = parser
            .parseFromString(object, 'text/xml')
            .documentElement;
        break;
    default:
        throw new Error('Argument error. (' + typeof(object) + ')');
    }

    return element;
}

function asString(thing) {
    if(typeof(thing) == 'string')
        return thing;
    else if(typeof(thing) == 'xml')
        return thing.toXMLString();
    else if(thing instanceof Ci.nsISupportsString)
        return thing.toString();
    else if(thing instanceof Ci.nsIDOMElement)
        return serialize(thing);
    else
        throw new Error('Bad argument.');
}

function serialize(element) {
    return serializer.serializeToString(element);
}


// INTERNALS
// ----------------------------------------------------------------------

function getLoginInfo(url, username) {
    var logins = Cc['@mozilla.org/login-manager;1']
        .getService(Ci.nsILoginManager)
        .findLogins({}, url, null, url);
    for(var i=0; i<logins.length; i++)
        if(logins[i].username == username)
            return logins[i];
}


