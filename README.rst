..
   Scaler - a Javascript library for responsive layout of sites and
            web apps consistent across devices
   Copyright © 2017 Stan Livitski
   
   Licensed under the Apache License, Version 2.0 with modifications,
   (the "License"); you may not use this file except in compliance
   with the License. You may obtain a copy of the License at

    https://raw.githubusercontent.com/StanLivitski/scaler/master/LICENSE
   
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
   
----------------
 scaler
----------------

*Scaler* is a Javascript library that simplifies development of web pages
with flexible layouts. With *scaler*, you can build sites and applications
that adjust to screen or window sizes on various devices and respond
to viewport changes while maintaining the same general appearance.

Responsive sizing and/or positioning of elements on a *scaler*-powered page
is enabled by adding special ``data-sc-`` attributes to such elements. Those
attributes contain Javascript expressions that will be computed when the page
is loaded and each time its viewport is resized. The suffixes of ``data-sc-``
attributes are, in most cases, the same as CSS properties of elements that
receive the computed values of such expressions. You can keep values of 
*scaler* attributes short by including a Javascript function that pre-computes
sizing and positioning variables of your choice. *Scaler* will call that
function each time it needs to recompute ``data-sc-`` expressions on the page,
and provide a context object for it to store those variables. Evaluation of
``data-sc-`` expressions will occur in the context of that object.

This strategy allows you to have more complex layouts than you can achieve
with relative CSS sizing and positioning. For example, you can show
elements with fixed aspect ratio without having to fix aspect ratio of a page
or panel that contains them. And your site or application won't need to rely
on the latest CSS features that may not work consistently across users'
gadgets and browsers.

About this repository
---------------------

This repository contains the *scaler*'s source code.
Its top-level components are:

=========================    ===============================================
``src``                      Directory with the source code of *scaler*'s
                             scripts and stylesheets.
``LICENSE``                  Document that describes the project's licensing
                             terms.
``NOTICE``                   Summary of license terms that apply to
                             *scaler*. 
``README.rst``               This document.
=========================    ===============================================

Using scaler
------------

Requirements
^^^^^^^^^^^^

To take advantage of *scaler*'s capabilities, a web page must meet certain
dependencies. First, it must run in a Javascript-enabled browser. Major
browsers supported by *scaler* are listed in the `Browser compatibility`_
section. *Scaler* may work with other browsers that have similar features,
though it hasn't been tested with them.

Further, the page must include or link the components listed in the
`Dependencies`_ section, which are required for *scaler* to function properly.

Browser compatibility
'''''''''''''''''''''

+-----------------------------------------------------------+---------------+
|  Name                                                     | Version       |
+===========================================================+===============+
| Firefox                                                   | 41 or newer   |
+-----------------------------------------------------------+---------------+
| Chrome                                                    | 37 or newer   |
+-----------------------------------------------------------+---------------+
| Internet Explorer                                         | 9 or newer    |
+-----------------------------------------------------------+---------------+


Dependencies
''''''''''''

+-----------------------------------------------------------+---------------+
|  Name / Download URL                                      | Version       |
+===========================================================+===============+
| | jQuery                                                  | 1.11 or newer |
| | http://jquery.com/                                      |               |
+-----------------------------------------------------------+---------------+

.. |                                                           |               |

Scaler and your application
^^^^^^^^^^^^^^^^^^^^^^^^^^^

To make *scaler* available to your application, you have to:

#. Comply with the toolkit's license terms. Please review the ``NOTICE``
   file at the root of this repository for licensing information.
#. Make ``.css`` and ``.js`` files from the ``src`` directory, or
   their minified versions, accessible for your users' browsers and
   link those files to your pages. For example, a *scaler*-powered page
   could start with the following code:

   ::

    <!DOCTYPE html>
    <html lang="en"> 
     <head>
       <meta charset="utf-8">
       <title>Scaler demo</title>
       <script src="jquery/jquery.js"></script>
       <link rel="stylesheet" type="text/css" href="scaler/scaler.css" />
       <script src="scaler/scaler.js"></script>
     
       ...

#. Provide a Javascript function that pre-computes variables for
   your sizing and positioning formulas. Store a reference to that function
   in ``scaler.prepareContext`` variable. You may delegate to the existing
   ``scaler.prepareContext`` function in your code as follows:
   
   ::

    <script type="text/javascript"><!--
     scaler.prepareContext = function()
     {
      var super_ = scaler.prepareContext;
      return function(context, $)
      {
        super_(context, $);
        with (context)
        {
            context.W = windowWidth;
            context.H = windowHeight;
            context.S = Math.min(W,H);
        }
      };
     }();
     // --></script>

#. Add ``data-sc-`` attributes to the page elements that you want
   dynamically scaled depending on the window or screen size and assign
   those elements the ``"scaler"`` class:
   
   ::

    <div id="square" style="position: absolute; background: green;"
     class="scaler" data-sc-height="S" data-sc-width="S"
     data-sc-top="(H-S)/2" data-sc-left="(W-S)/2">
    </div>
   
Please refer to the API comments in ``src/scaler.js`` for further usage
details.
