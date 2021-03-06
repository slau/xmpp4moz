/*
 * Copyright 2006-2009 by Massimiliano Mirra
 *
 * This file is part of xmpp4moz.
 *
 * SamePlace is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the
 * Free Software Foundation; either version 3 of the License, or (at your
 * option) any later version.
 *
 * SamePlace is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code
 * versions of this program must display Appropriate Legal Notices, as
 * required under Section 5 of the GNU General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU General Public License
 * version 3, modified versions must display the "Powered by SamePlace"
 * logo to users in a legible manner and the GPLv3 text must be made
 * available to them.
 *
 * Author: Massimiliano Mirra, <bard [at] hyperstruct [dot] net>
 *
 */

// EXPORTS
// ----------------------------------------------------------------------

// Filled dynamically below
var EXPORTED_SYMBOLS = [];


// GLOBAL DEFINITIONS
// ----------------------------------------------------------------------

var ns_xml          = 'http://www.w3.org/XML/1998/namespace';
var ns_auth         = 'jabber:iq:auth';
var ns_xhtml        = 'http://www.w3.org/1999/xhtml';
var ns_xhtml_im     = 'http://jabber.org/protocol/xhtml-im';
var ns_muc_user     = 'http://jabber.org/protocol/muc#user';
var ns_muc          = 'http://jabber.org/protocol/muc';
var ns_register     = 'jabber:iq:register';
var ns_roster       = 'jabber:iq:roster';
var ns_delay        = 'jabber:x:delay';
var ns_xul          = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
var ns_private      = 'jabber:iq:private';
var ns_bookmarks    = 'storage:bookmarks';
var ns_chatstates   = 'http://jabber.org/protocol/chatstates';
var ns_event        = 'jabber:x:event';
var ns_stanzas      = 'urn:ietf:params:xml:ns:xmpp-stanzas';
var ns_http_auth    = 'http://jabber.org/protocol/http-auth';
var ns_x4m          = 'http://hyperstruct.net/xmpp4moz/protocol/internal';
var ns_x4m_in       = 'http://hyperstruct.net/xmpp4moz/protocol/internal';
var ns_x4m_ext      = 'http://hyperstruct.net/xmpp4moz/protocol/external';
var ns_vcard        = 'vcard-temp';
var ns_vcard_update = 'vcard-temp:x:update';
var ns_disco_info   = 'http://jabber.org/protocol/disco#info';
var ns_stream       = 'urn:ietf:params:xml:ns:xmpp-streams';
var ns_sasl         = 'urn:ietf:params:xml:ns:xmpp-sasl';
var ns_tls          = 'urn:ietf:params:xml:ns:xmpp-tls';
var ns_session      = 'urn:ietf:params:xml:ns:xmpp-session';
var ns_caps         = 'http://jabber.org/protocol/caps';

for(var name in this)
    if(name.match(/^ns_/))
        EXPORTED_SYMBOLS.push(name);
