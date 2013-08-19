/*
The MIT License

Copyright (c) 2010-2011-2012 Ibon Tolosana [@hyperandroid]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

Version: 0.6 build: 5

Created on:
DATE: 2013-07-01
TIME: 04:58:32
*/


(function(global, __obj_namespace) {

    String.prototype.endsWith= function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };

    Function.prototype.bind = Function.prototype.bind || function () {
                var fn = this;                                   // the function
                var args = Array.prototype.slice.call(arguments);  // copy the arguments.
                var obj = args.shift();                           // first parameter will be context 'this'
                return function () {
                    return fn.apply(
                        obj,
                        args.concat(Array.prototype.slice.call(arguments)));
                }
            };

    global.isArray = function (input) {
        return typeof(input) == 'object' && (input instanceof Array);
    };
    global.isString = function (input) {
        return typeof(input) == 'string';
    };
    global.isFunction = function( input ) {
        return typeof input == "function"
    }

    var initializing = false;

    // The base Class implementation (does nothing)
    var Class = function () {
    };

    Class['__CLASS']='Class';

    // Create a new Class that inherits from this class
    Class.extend = function (extendingProt, constants, name, aliases, flags) {

        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // The dummy class constructor
        function CAATClass() {
            // All construction is actually done in the init method
            if (!initializing && this.__init) {
                this.__init.apply(this, arguments);
            }
        }

        // Populate our constructed prototype object
        CAATClass.prototype = prototype;
        // Enforce the constructor to be what we expect
        CAATClass.prototype.constructor = CAATClass;
        CAATClass.superclass = _super;
        // And make this class extendable
        CAATClass.extend = Class.extend;

        assignNamespace( name, CAATClass );
        if ( constants ) {
            constants= (isFunction(constants) ? constants() : constants);
            for( var constant in constants ) {
                if ( constants.hasOwnProperty(constant) ) {
                    CAATClass[ constant ]= constants[constant];
                }
            }
        }

        CAATClass["__CLASS"]= name;

        if ( aliases ) {
            if ( !isArray(aliases) ) {
                aliases= [aliases];
            }
            for( var i=0; i<aliases.length; i++ ) {
                ensureNamespace( aliases[i] );
                var ns= assignNamespace( aliases[i], CAATClass );

                // assign constants to alias classes.
                if ( constants ) {
                    for( var constant in constants ) {
                        if ( constants.hasOwnProperty(constant) ) {
                            ns[ constant ]= constants[constant];
                        }
                    }
                }
            }
        }

        extendingProt= (isFunction(extendingProt) ? extendingProt() : extendingProt);

        // Copy the properties over onto the new prototype
        for (var fname in extendingProt) {
            // Check if we're overwriting an existing function
            prototype[fname] = ( (fname === "__init" || (flags && flags.decorated) ) && isFunction(extendingProt[fname]) && isFunction(_super[fname]) ) ?
                (function (name, fn) {
                    return function () {
                        var tmp = this.__super;
                        this.__super = _super[name];
                        var ret = fn.apply(this, arguments);
                        this.__super = tmp;
                        return ret;
                    };
                })(fname, extendingProt[fname]) :

                extendingProt[fname];
        }

        return CAATClass;
    }

    var Node= function( obj ) { //name, dependencies, callback ) {
        this.name= obj.defines;
        this.extendWith= obj.extendsWith;
        this.callback= obj.onCreate;
        this.callbackPreCreation= obj.onPreCreate;
        this.dependencies= obj.depends;
        this.baseClass= obj.extendsClass;
        this.aliases= obj.aliases;
        this.constants= obj.constants;
        this.decorated= obj.decorated;

        this.children= [];

        return this;
    };

    Node.prototype= {
        children:       null,
        name:           null,
        extendWith:     null,
        callback:       null,
        dependencies:   null,
        baseClass:      null,
        aliases:        null,
        constants:      null,

        decorated:      false,

        solved:         false,
        visited:        false,

        status : function() {
            console.log("  Module: "+this.name+
                (this.dependencies.length ?
                    (" unsolved_deps:["+this.dependencies+"]") :
                    " no dependencies.")+
                ( this.solved ? " solved" : " ------> NOT solved.")
            );
        },

        removeDependency : function( modulename ) {
            for( var i=0; i<this.dependencies.length; i++ ) {
                if ( this.dependencies[i]===modulename ) {
                    this.dependencies.splice(i,1);
                    break;
                }
            }


        },

        assignDependency : function( node ) {

            var i;
            for( i=0; i<this.dependencies.length; i++ ) {
                if ( this.dependencies[i] === node.name ) {
                    this.children.push( node );
                    this.dependencies.splice(i,1);
//                    console.log("Added dependency: "+node.name+" on "+this.name);
                    break;
                }
            }
        },

        isSolved : function() {
            return this.solved;
        },

        solveDeep : function() {

            if ( this.visited ) {
                return true;
            }

            this.visited= true;

            if ( this.solved ) {
                return true;
            }

            if ( this.dependencies.length!==0 ) {
                return false;
            }

            var b= true;
            for( var i=0; i<this.children.length; i++ ) {
                if (! this.children[i].solveDeep() ) {
                    return false;
                }
            }

            //////
            this.__initModule();

            this.solved= true;
            mm.solved( this );

            return true;
        },

        __initModule : function() {

            var c= null;
            if ( this.baseClass ) {
                c= findClass( this.baseClass );

                if ( !c ) {
                    console.log("  "+this.name+" -> Can't extend non-existant class: "+this.baseClass );
                    return;
                }

            } else {
                c= Class;
            }

            c= c.extend( this.extendWith, this.constants, this.name, this.aliases, { decorated : this.decorated } );

            console.log("Created module: "+this.name);

            if ( this.callback ) {
                this.callback();
            }

        }
    };

    var ScriptFile= function(path, module) {
        this.path= path;
        this.module= module;
        return this;
    }

    ScriptFile.prototype= {
        path : null,
        processed: false,
        module: null,

        setProcessed : function() {
            this.processed= true;
        },

        isProcessed : function() {
            return this.processed;
        }
    };

    var ModuleManager= function() {
        this.nodes= [];
        this.loadedFiles= [];
        this.path= {};
        this.solveListener= [];
        this.orderedSolvedModules= [];
        this.readyListener= [];

        return this;
    };

    ModuleManager.baseURL= "";
    ModuleManager.modulePath= {};
    ModuleManager.sortedModulePath= [];
    ModuleManager.symbol= {};

    ModuleManager.prototype= {

        nodes:      null,           // built nodes.
        loadedFiles:null,           // list of loaded files. avoid loading each file more than once
        solveListener: null,        // listener for a module solved
        readyListener: null,        // listener for all modules solved
        orderedSolvedModules: null, // order in which modules where solved.

        addSolvedListener : function( modulename, callback ) {
            this.solveListener.push( {
                name : modulename,
                callback : callback
            });
        },

        solved : function( module ) {
            var i;

            for( i=0; i<this.solveListener.length; i++ ) {
                if ( this.solveListener[i].name===module.name) {
                    this.solveListener[i].callback();
                }
            }

            this.orderedSolvedModules.push( module );

            this.notifyReady();
        },

        notifyReady : function() {
            var i;

            for( i=0; i<this.nodes.length; i++ ) {
                if ( !this.nodes[i].isSolved() ) {
                    return;
                }
            }

            // if there's any pending files to be processed, still not notify about being solved.
            for( i=0; i<this.loadedFiles.length; i++ ) {
                if ( !this.loadedFiles[i].isProcessed() ) {
                    // aun hay ficheros sin procesar, no notificar.
                    return;
                }
            }

            /**
             * Make ModuleManager.bring reentrant.
             */
            var me= this;
            var arr= Array.prototype.slice.call(this.readyListener);
            setTimeout( function() {
                for( var i=0; i<arr.length; i++ ) {
                    arr[i]();
                }
            }, 0 );

            this.readyListener= [];
        },

        status : function() {
            for( var i=0; i<this.nodes.length; i++ ) {
                this.nodes[i].status();
            }
        },

        module : function( obj ) {//name, dependencies, callback ) {

            var node, nnode, i;

            if ( this.isModuleScheduledToSolve( obj.defines ) ) {
//                console.log("Discarded module: "+obj.class+" (already loaded)");
                return this;
            }

            if ( obj.onPreCreate ) {
//                console.log("  --> "+obj.defines+" onPrecreation");
                try {
                    obj.onPreCreate();
                } catch(e) {
                    console.log("  -> catched "+e+" on module "+obj.defines+" preCreation.");
                }
            }

            if (!obj.depends ) {
                obj.depends= [];
            }

            var dependencies= obj.depends;

            if ( dependencies ) {
                if ( !isArray(dependencies) ) {
                    dependencies= [ dependencies ];
                    obj.depends= dependencies;
                }
            }

            // elimina dependencias ya resueltas en otras cargas.
            i=0;
            while( i<dependencies.length ) {
                if ( this.alreadySolved( dependencies[i] ) ) {
                     dependencies.splice(i,1);
                } else {
                    i++;
                }
            }

            nnode= new Node( obj );

            // asignar nuevo nodo a quien lo tenga como dependencia.
            for( var i=0; i<this.nodes.length; i++ ) {
                this.nodes[i].assignDependency(nnode);
            }
            this.nodes.push( nnode );

            /**
             * Making dependency resolution a two step process will allow us to pack all modules into one
             * single file so that the module manager does not have to load external files.
             * Useful when CAAt has been packed into one single bundle.
             */

            /**
             * remove already loaded modules dependencies.
             */
            for( i=0; i<obj.depends.length;  ) {

                if ( this.isModuleScheduledToSolve( obj.depends[i] ) ) {
                    var dep= this.findNode( obj.depends[i] );
                    if ( null!==dep ) {
                        nnode.assignDependency( dep );
                    } else {
                        //// ERRR
                        alert("Module loaded and does not exist in loaded modules nodes. "+obj.depends[i]);
                        i++;
                    }
                } else {
                    i+=1;
                }
            }

            /**
             * now, for the rest of non solved dependencies, load their files.
             */
            (function(mm, obj) {
                setTimeout( function() {
                    for( i=0; i<obj.depends.length; i++ ) {
                        mm.loadFile( obj.depends[i] );
                    }
                }, 0 );
            })(this, obj);

            return this;

        },

        findNode : function( name ) {
            for( var i=0; i<this.nodes.length; i++ ) {
                if ( this.nodes[i].name===name ) {
                    return this.nodes[i];
                }
            }

            return null;
        } ,

        alreadySolved : function( name ) {
            for( var i= 0; i<this.nodes.length; i++ ) {
                if ( this.nodes[i].name===name && this.nodes[i].isSolved() ) {
                    return true;
                }
            }

            return false;
        },

        exists : function(path) {
            var path= path.split(".");
            var root= global;

            for( var i=0; i<path.length; i++ ) {
                if (!root[path[i]]) {
                    return false;
                }

                root= root[path[i]];
            }

            return true;
        },

        loadFile : function( module ) {


            if (this.exists(module)) {
                return;
            }

            var path= this.getPath( module );

            // avoid loading any js file more than once.
            for( var i=0; i<this.loadedFiles.length; i++ ) {
                if ( this.loadedFiles[i].path===path ) {
                    return;
                }
            }

            var sf= new ScriptFile( path, module );
            this.loadedFiles.push( sf );

            var node= document.createElement("script");
            node.type = 'text/javascript';
            node.charset = 'utf-8';
            node.async = true;
            node.addEventListener('load', this.moduleLoaded.bind(this), false);
            node.addEventListener('error', this.moduleErrored.bind(this), false);
            node.setAttribute('module-name', module);
            node.src = path+(!DEBUG ? "?"+(new Date().getTime()) : "");

            document.getElementsByTagName('head')[0].appendChild( node );

        },

        /**
         * Resolve a module name.
         *
         *  + if the module ends with .js
         *    if starts with /, return as is.
         *    else reppend baseURL and return.
         *
         * @param module
         */
        getPath : function( module ) {

            // endsWith
            if ( module.endsWith(".js") ) {
                if ( module.charAt(0)!=="/" ) {
                    module= ModuleManager.baseURL+module;
                } else {
                    module= module.substring(1);
                }
                return module;
            }

            var i, symbol;

            for( symbol in ModuleManager.symbol ) {
                if ( module===symbol ) {
                    return  ModuleManager.baseURL + ModuleManager.symbol[symbol];
                }
            }

            //for( var modulename in ModuleManager.modulePath ) {
            for( i=0; i<ModuleManager.sortedModulePath.length; i++ ) {
                var modulename= ModuleManager.sortedModulePath[i];

                if ( ModuleManager.modulePath.hasOwnProperty(modulename) ) {
                    var path= ModuleManager.modulePath[modulename];

                    // startsWith
                    if ( module.indexOf(modulename)===0 ) {
                        // +1 to skip '.' class separator.
                        var nmodule= module.substring(modulename.length + 1);

                        /**
                         * Avoid name clash:
                         * CAAT.Foundation and CAAT.Foundation.Timer will both be valid for
                         * CAAT.Foundation.Timer.TimerManager module.
                         * So in the end, the module name can't have '.' after chopping the class
                         * namespace.
                         */

                        nmodule= nmodule.replace(/\./g,"/");

                        //if ( nmodule.indexOf(".")===-1 ) {
                            nmodule= path+nmodule+".js";
                            return ModuleManager.baseURL + nmodule;
                        //}
                    }
                }
            }

            // what's that ??!?!?!?
            return ModuleManager.baseURL + module.replace(/\./g,"/") + ".js";
        },

        isModuleScheduledToSolve : function( name ) {
            for( var i=0; i<this.nodes.length; i++ ) {
                if ( this.nodes[i].name===name ) {
                    return true;
                }
            }
            return false;
        },

        moduleLoaded : function(e) {
            if (e.type==="load") {

                var node = e.currentTarget || e.srcElement || e.target;
                var mod= node.getAttribute("module-name");

                // marcar fichero de modulo como procesado.
                for( var i=0; i<this.loadedFiles.length; i++ ) {
                    if ( this.loadedFiles[i].module===mod ) {
                        this.loadedFiles[i].setProcessed();
                        break;
                    }
                }

                for( var i=0; i<this.nodes.length; i++ ) {
                    this.nodes[i].removeDependency( mod );
                }

                for( var i=0; i<this.nodes.length; i++ ) {
                    for( var j=0; j<this.nodes.length; j++ ) {
                        this.nodes[j].visited= false;
                    }
                    this.nodes[i].solveDeep();
                }

                /**
                 * Despues de cargar un fichero, este puede contener un modulo o no.
                 * Si todos los ficheros que se cargan fueran bibliotecas, nunca se pasaria de aqui porque
                 * no se hace una llamada a solveDeep, y notificacion a solved, y de ahí a notifyReady.
                 * Por eso se hace aqui una llamada a notifyReady, aunque pueda ser redundante.
                 */
                var me= this;
                setTimeout(function() {
                    me.notifyReady();
                }, 0 );
            }
        },

        moduleErrored : function(e) {
            var node = e.currentTarget || e.srcElement;
            console.log("Error loading module: "+ node.getAttribute("module-name") );
        },

        solvedInOrder : function() {
            for( var i=0; i<this.orderedSolvedModules.length; i++ ) {
                console.log(this.orderedSolvedModules[i].name);
            }
        },

        solveAll : function() {
            for( var i=0; i<this.nodes.length; i++ ) {
                this.nodes[i].solveDeep();
            }
        },

        onReady : function( f ) {
            this.readyListener.push(f);
        }

    };

    function ensureNamespace( qualifiedClassName ) {
        var ns= qualifiedClassName.split(".");
        var _global= global;
        var ret= null;
        for( var i=0; i<ns.length-1; i++ ) {
            if ( !_global[ns[i]] ) {
                _global[ns[i]]= {};
            }
            _global= _global[ns[i]];
            ret= _global;
        }

        return ret;
    }

    /**
     *
     * Create a namespace object from a string.
     *
     * @param namespace {string}
     * @param obj {object}
     * @return {object} the namespace object
     */
    function assignNamespace( namespace, obj ) {
        var ns= namespace.split(".");
        var _global= global;
        for( var i=0; i<ns.length-1; i++ ) {
            if ( !_global[ns[i]] ) {
                console.log("    Error assigning value to namespace :"+namespace+". '"+ns[i]+"' does not exist.");
                return null;
            }

            _global= _global[ns[i]];
        }

        _global[ ns[ns.length-1] ]= obj;

        return _global[ ns[ns.length-1] ];
    }

    function findClass( qualifiedClassName ) {
        var ns= qualifiedClassName.split(".");
        var _global= global;
        for( var i=0; i<ns.length; i++ ) {
            if ( !_global[ns[i]] ) {
                return null;
            }

            _global= _global[ns[i]];
        }

        return _global;
    }

    var mm= new ModuleManager();
    var DEBUG= false;


    /**
     * CAAT is the namespace for all CAAT gaming engine object classes.
     *
     * @name CAAT
     * @namespace
     */

    if ( typeof(__obj_namespace)==="undefined" ) {
        __obj_namespace= (window.CAAT = window.CAAT || {} );
    }

    NS= __obj_namespace;

//    global.CAAT= global.CAAT || {};

    /**
     *
     * This function defines CAAT modules, and creates Constructor Class objects.
     *
     * obj parameter has the following structure:
     * {
     *   defines{string},           // class name
     *   depends{Array<string>=},   // dependencies class names
     *   extendsClass{string},      // class to extend from
     *   extensdWith{object},       // actual prototype to extend
     *   aliases{Array<string>}     // other class names
     * }
     *
     * @name Module
     * @memberof CAAT
     * @static
     *
     * @param obj {object}
     */
    NS.Module= function loadModule(obj) {

        if (!obj.defines) {
            console.error("Bad module definition: "+obj);
            return;
        }

        ensureNamespace(obj.defines);

        mm.module( obj );

    };

    /**
     * @name ModuleManager
     * @memberOf CAAT
     * @namespace
     */
    NS.ModuleManager= {};

    /**
     * Define global base position for modules structure.
     * @param baseURL {string}
     * @return {*}
     */
    NS.ModuleManager.baseURL= function(baseURL) {

        if ( !baseURL ) {
            return NS.Module;
        }

        if (!baseURL.endsWith("/") ) {
            baseURL= baseURL + "/";
        }

        ModuleManager.baseURL= baseURL;
        return NS.ModuleManager;
    };

    /**
     * Define a module path. Multiple module paths can be specified.
     * @param module {string}
     * @param path {string}
     */
    NS.ModuleManager.setModulePath= function( module, path ) {

        if ( !path.endsWith("/") ) {
            path= path + "/";
        }

        if ( !ModuleManager.modulePath[module] ) {
            ModuleManager.modulePath[ module ]= path;

            ModuleManager.sortedModulePath.push( module );

            /**
             * Sort function so that CAAT.AB is below CAAT.AB.CD
             */
            ModuleManager.sortedModulePath.sort( function(a,b) {
                if (a==b) {
                    return 0;
                }
                return a<b ? 1 : -1;
            } );
        }
        return NS.ModuleManager;
    };

    /**
     * Define a symbol, or file to be loaded and checked dependencies against.
     * @param symbol {string}
     * @param path {string}
     * @return {*}
     */
    NS.ModuleManager.symbol= function( symbol, path ) {

        if ( !ModuleManager.symbol[symbol] ) {
            ModuleManager.symbol[symbol]= path;
        }

        return NS.ModuleManager;
    };

    /**
     * Bring the given object, and if no present, start solving and loading dependencies.
     * @param file {string}
     * @return {*}
     */
    NS.ModuleManager.bring= function( file ) {

        if ( !isArray(file) ) {
            file= [file];
        }

        for( var i=0; i<file.length; i++ ) {
            mm.loadFile( file[i] );
        }

        return NS.ModuleManager;
    };

    /**
     * Get CAAT´s module manager status.
     */
    NS.ModuleManager.status= function() {
        mm.status();
    }

    /**
     * Add an observer for a given module load event.
     * @param modulename {string}
     * @param callback {function()}
     * @return {*}
     */
    NS.ModuleManager.addModuleSolvedListener= function(modulename,callback) {
        mm.addSolveListener( modulename, callback );
        return NS.ModuleManager;
    }

    /**
     * Load a javascript file.
     * @param file {string}
     * @param onload {function()}
     * @param onerror {function()}
     */
    NS.ModuleManager.load= function(file, onload, onerror) {
        var node= document.createElement("script");
        node.type = 'text/javascript';
        node.charset = 'utf-8';
        node.async = true;
        if ( onload ) {
            node.addEventListener('load', onload, false);
        }
        if ( onerror ) {
            node.addEventListener('error', onerror, false);
        }

        node.addEventListener("load", function( ) {
            mm.solveAll();
        }, false);

        node.src = file+(!DEBUG ? "?"+(new Date().getTime()) : "");

        document.getElementsByTagName('head')[0].appendChild( node );

        // maybe this file has all the modules needed so no more file loading/module resolution must be performed.

    }

    /**
     * Dump solved modules and get them sorted in the order they were resolved.
     */
    NS.ModuleManager.solvedInOrder= function() {
        mm.solvedInOrder();
    }

    /**
     * This method will be called everytime all the specified to-be-brought dependencies have been solved.
     * @param f
     * @return {*}
     */
    NS.ModuleManager.onReady= function(f) {
        mm.onReady(f);
        return NS.ModuleManager;
    }

    /**
     * Solve all elements specified in the module loaded.
     * It is useful when minimizing a file.
     */
    NS.ModuleManager.solveAll= function() {
        mm.solveAll();
    }

    /**
     * Enable debug capabilities for the loaded modules.
     * Otherwise, the modules will have cache invalidation features.
     * @param d {boolean}
     * @return {*}
     */
    NS.ModuleManager.debug= function(d) {
        DEBUG= d;
        return NS.ModuleManager;
    }

    /**
     * @name Class
     * @memberOf CAAT
     * @constructor
     */
    NS.Class= Class;

})(this, undefined);
/**
 * See LICENSE file.
 *
 **/

CAAT.Module( {

    defines: "CAAT.Core.Constants",
    depends : [
        "CAAT.Math.Matrix"
    ],

    extendsWith: function() {

        /**
         * @lends CAAT
         */

        /**
         * // do not clamp coordinates. speeds things up in older browsers.
         * @type {Boolean}
         * @private
         */
        CAAT.CLAMP= false;

        /**
         * This function makes the system obey decimal point calculations for actor's position, size, etc.
         * This may speed things up in some browsers, but at the cost of affecting visuals (like in rotating
         * objects).
         *
         * Latest Chrome (20+) is not affected by this.
         *
         * Default CAAT.Matrix try to speed things up.
         *
         * @param clamp {boolean}
         */
        CAAT.setCoordinateClamping= function( clamp ) {
            CAAT.CLAMP= clamp;
            CAAT.Math.Matrix.setCoordinateClamping(clamp);
        };

        /**
         * Log function which deals with window's Console object.
         */
        CAAT.log= function() {
            if(window.console){
                window.console.log( Array.prototype.slice.call(arguments) );
            }
        };

        /**
         * Control how CAAT.Font and CAAT.TextActor control font ascent/descent values.
         * 0 means it will guess values from a font height
         * 1 means it will try to use css to get accurate ascent/descent values and fall back to the previous method
         *   in case it couldn't.
         *
         * @type {Number}
         */
        CAAT.CSS_TEXT_METRICS=      0;

        /**
         * is GLRendering enabled.
         * @type {Boolean}
         */
        CAAT.GLRENDER= false;

        /**
         * set this variable before building CAAT.Director intances to enable debug panel.
         */
        CAAT.DEBUG= false;

        /**
         * show Bounding Boxes
         * @type {Boolean}
         */
        CAAT.DEBUGBB= false;

        /**
         * Bounding Boxes color.
         * @type {String}
         */
        CAAT.DEBUGBBBCOLOR = '#00f';

        /**
         * debug axis aligned bounding boxes.
         * @type {Boolean}
         */
        CAAT.DEBUGAABB = false;

        /**
         * Bounding boxes color.
         * @type {String}
         */
        CAAT.DEBUGAABBCOLOR = '#f00';

        /**
         * if CAAT.Director.setClear uses CLEAR_DIRTY_RECTS, this will show them on screen.
         * @type {Boolean}
         */
        CAAT.DEBUG_DIRTYRECTS= false;

        /**
         * Do not consider mouse drag gesture at least until you have dragged
         * DRAG_THRESHOLD_X and DRAG_THRESHOLD_Y pixels.
         * This is suitable for tablets, where just by touching, drag events are delivered.
         */
        CAAT.DRAG_THRESHOLD_X=      5;
        CAAT.DRAG_THRESHOLD_Y=      5;

        /**
         * When switching scenes, cache exiting scene or not. Set before building director instance.
         * @type {Boolean}
         */
        CAAT.CACHE_SCENE_ON_CHANGE= true;

        return {
        }
    }
} );

extend = function (subc, superc) {
    var subcp = subc.prototype;

    // Class pattern.
    var CAATObject = function () {
    };
    CAATObject.prototype = superc.prototype;

    subc.prototype = new CAATObject();       // chain prototypes.
    subc.superclass = superc.prototype;
    subc.prototype.constructor = subc;

    // Reset constructor. See Object Oriented Javascript for an in-depth explanation of this.
    if (superc.prototype.constructor === Object.prototype.constructor) {
        superc.prototype.constructor = superc;
    }

    // los metodos de superc, que no esten en esta clase, crear un metodo que
    // llama al metodo de superc.
    for (var method in subcp) {
        if (subcp.hasOwnProperty(method)) {
            subc.prototype[method] = subcp[method];

            /**
             * Sintactic sugar to add a __super attribute on every overriden method.
             * Despite comvenient, it slows things down by 5fps.
             *
             * Uncomment at your own risk.
             *
             // tenemos en super un metodo con igual nombre.
             if ( superc.prototype[method]) {
            subc.prototype[method]= (function(fn, fnsuper) {
                return function() {
                    var prevMethod= this.__super;

                    this.__super= fnsuper;

                    var retValue= fn.apply(
                            this,
                            Array.prototype.slice.call(arguments) );

                    this.__super= prevMethod;

                    return retValue;
                };
            })(subc.prototype[method], superc.prototype[method]);
        }
             */

        }
    }
};


extendWith = function (base, subclass, with_object) {
    var CAATObject = function () {
    };

    CAATObject.prototype = base.prototype;

    subclass.prototype = new CAATObject();
    subclass.superclass = base.prototype;
    subclass.prototype.constructor = subclass;

    if (base.prototype.constructor === Object.prototype.constructor) {
        base.prototype.constructor = base;
    }

    if (with_object) {
        for (var method in with_object) {
            if (with_object.hasOwnProperty(method)) {
                subclass.prototype[ method ] = with_object[method];
                /*
                 if ( base.prototype[method]) {
                 subclass.prototype[method]= (function(fn, fnsuper) {
                 return function() {
                 var prevMethod= this.__super;
                 this.__super= fnsuper;
                 var retValue= fn.apply(this, arguments );
                 this.__super= prevMethod;

                 return retValue;
                 };
                 })(subclass.prototype[method], base.prototype[method]);
                 }
                 /**/
            }
        }
    }
};



function proxyFunction(object, method, preMethod, postMethod, errorMethod) {

    return function () {

        var args = Array.prototype.slice.call(arguments);

        // call pre-method hook if present.
        if (preMethod) {
            preMethod({
                object: object,
                method: method,
                arguments: args });
        }

        var retValue = null;

        try {
            // apply original object call with proxied object as
            // function context.
            retValue = object[method].apply(object, args);

            // everything went right on function call, the call
            // post-method hook if present
            if (postMethod) {
                /*var rr= */
                var ret2 = postMethod({
                    object: object,
                    method: method,
                    arguments: args });

                if (ret2) {
                    retValue = ret2;
                }
            }
        } catch (e) {
            // an exeception was thrown, call exception-method hook if
            // present and return its result as execution result.
            if (errorMethod) {
                retValue = errorMethod({
                    object: object,
                    method: method,
                    arguments: args,
                    exception: e});
            } else {
                // since there's no error hook, just throw the exception
                throw e;
            }
        }

        // return original returned value to the caller.
        return retValue;
    };

}

function proxyAttribute( proxy, object, attribute, getter, setter) {

    proxy.__defineGetter__(attribute, function () {
        if (getter) {
            getter(object, attribute);
        }
        return object[attribute];
    });
    proxy.__defineSetter__(attribute, function (value) {
        object[attribute] = value;
        if (setter) {
            setter(object, attribute, value);
        }
    });
}

function proxyObject(object, preMethod, postMethod, errorMethod, getter, setter) {

    /**
     * If not a function then only non privitive objects can be proxied.
     * If it is a previously created proxy, return the proxy itself.
     */
    if (typeof object !== 'object' || isArray(object) || isString(object) || object.$proxy) {
        return object;
    }

    var proxy = {};

    // hold the proxied object as member. Needed to assign proper
    // context on proxy method call.
    proxy.$proxy = true;
    proxy.$proxy_delegate = object;

    // For every element in the object to be proxied
    for (var method in object) {

        if (method === "constructor") {
            continue;
        }

        // only function members
        if (typeof object[method] === 'function') {
            proxy[method] = proxyFunction(object, method, preMethod, postMethod, errorMethod );
        } else {
            proxyAttribute(proxy, object, method, getter, setter);
        }
    }

    // return our newly created and populated with functions proxied object.
    return proxy;
}


CAAT.Module({
    defines : "CAAT.Core.Class",
    extendsWith : function() {

        /**
         * See LICENSE file.
         *
         * Extend a prototype with another to form a classical OOP inheritance procedure.
         *
         * @param subc {object} Prototype to define the base class
         * @param superc {object} Prototype to be extended (derived class).
         */


        return {

        };
    }
});/**
 * See LICENSE file.
 *
 **/

CAAT.Module( {

    /**
     * @name Math
     * @memberOf CAAT
     * @namespace
     */

    /**
     * @name Bezier
     * @memberOf CAAT.Math
     * @extends CAAT.Math.Curve
     * @constructor
     */

    defines:    "CAAT.Math.Bezier",
    depends:    ["CAAT.Math.Curve"],
    extendsClass:    "CAAT.Math.Curve",
    aliases:    ["CAAT.Bezier"],
    extendsWith:    function() {
        return {

            /**
             * @lends CAAT.Math.Bezier.prototype
             */

            /**
             * This curbe is cubic or quadratic bezier ?
             */
            cubic:		false,

            applyAsPath : function( director ) {

                var cc= this.coordlist;

                if ( this.cubic ) {
                    director.ctx.bezierCurveTo(
                        cc[1].x,
                        cc[1].y,
                        cc[2].x,
                        cc[2].y,
                        cc[3].x,
                        cc[3].y
                    );
                } else {
                    director.ctx.quadraticCurveTo(
                        cc[1].x,
                        cc[1].y,
                        cc[2].x,
                        cc[2].y
                    );
                }
                return this;
            },
            isQuadric : function() {
                return !this.cubic;
            },
            isCubic : function() {
                return this.cubic;
            },
            /**
             * Set this curve as a cubic bezier defined by the given four control points.
             * @param cp0x {number}
             * @param cp0y {number}
             * @param cp1x {number}
             * @param cp1y {number}
             * @param cp2x {number}
             * @param cp2y {number}
             * @param cp3x {number}
             * @param cp3y {number}
             */
            setCubic : function( cp0x,cp0y, cp1x,cp1y, cp2x,cp2y, cp3x,cp3y ) {

                this.coordlist= [];

                this.coordlist.push( new CAAT.Math.Point().set(cp0x, cp0y ) );
                this.coordlist.push( new CAAT.Math.Point().set(cp1x, cp1y ) );
                this.coordlist.push( new CAAT.Math.Point().set(cp2x, cp2y ) );
                this.coordlist.push( new CAAT.Math.Point().set(cp3x, cp3y ) );

                this.cubic= true;
                this.update();

                return this;
            },
            /**
             * Set this curve as a quadric bezier defined by the three control points.
             * @param cp0x {number}
             * @param cp0y {number}
             * @param cp1x {number}
             * @param cp1y {number}
             * @param cp2x {number}
             * @param cp2y {number}
             */
            setQuadric : function(cp0x,cp0y, cp1x,cp1y, cp2x,cp2y ) {

                this.coordlist= [];

                this.coordlist.push( new CAAT.Math.Point().set(cp0x, cp0y ) );
                this.coordlist.push( new CAAT.Math.Point().set(cp1x, cp1y ) );
                this.coordlist.push( new CAAT.Math.Point().set(cp2x, cp2y ) );

                this.cubic= false;
                this.update();

                return this;
            },
            setPoints : function( points ) {
                if ( points.length===3 ) {
                    this.coordlist= points;
                    this.cubic= false;
                    this.update();
                } else if (points.length===4 ) {
                    this.coordlist= points;
                    this.cubic= true;
                    this.update();
                } else {
                    throw 'points must be an array of 3 or 4 CAAT.Point instances.'
                }

                return this;
            },
            /**
             * Paint this curve.
             * @param director {CAAT.Director}
             */
            paint : function( director ) {
                if ( this.cubic ) {
                    this.paintCubic(director);
                } else {
                    this.paintCuadric( director );
                }

                CAAT.Math.Bezier.superclass.paint.call(this,director);

            },
            /**
             * Paint this quadric Bezier curve. Each time the curve is drawn it will be solved again from 0 to 1 with
             * CAAT.Bezier.k increments.
             *
             * @param director {CAAT.Director}
             * @private
             */
            paintCuadric : function( director ) {
                var x1,y1;
                x1 = this.coordlist[0].x;
                y1 = this.coordlist[0].y;

                var ctx= director.ctx;

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x1,y1);

                var point= new CAAT.Math.Point();
                for(var t=this.k;t<=1+this.k;t+=this.k){
                    this.solve(point,t);
                    ctx.lineTo(point.x, point.y );
                }

                ctx.stroke();
                ctx.restore();

            },
            /**
             * Paint this cubic Bezier curve. Each time the curve is drawn it will be solved again from 0 to 1 with
             * CAAT.Bezier.k increments.
             *
             * @param director {CAAT.Director}
             * @private
             */
            paintCubic : function( director ) {

                var x1,y1;
                x1 = this.coordlist[0].x;
                y1 = this.coordlist[0].y;

                var ctx= director.ctx;

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x1,y1);

                var point= new CAAT.Math.Point();
                for(var t=this.k;t<=1+this.k;t+=this.k){
                    this.solve(point,t);
                    ctx.lineTo(point.x, point.y );
                }

                ctx.stroke();
                ctx.restore();
            },
            /**
             * Solves the curve for any given parameter t.
             * @param point {CAAT.Point} the point to store the solved value on the curve.
             * @param t {number} a number in the range 0..1
             */
            solve : function(point,t) {
                if ( this.cubic ) {
                    return this.solveCubic(point,t);
                } else {
                    return this.solveQuadric(point,t);
                }
            },
            /**
             * Solves a cubic Bezier.
             * @param point {CAAT.Point} the point to store the solved value on the curve.
             * @param t {number} the value to solve the curve for.
             */
            solveCubic : function(point,t) {

                var t2= t*t;
                var t3= t*t2;

                var cl= this.coordlist;
                var cl0= cl[0];
                var cl1= cl[1];
                var cl2= cl[2];
                var cl3= cl[3];

                point.x=(
                    cl0.x + t * (-cl0.x * 3 + t * (3 * cl0.x-
                    cl0.x*t)))+t*(3*cl1.x+t*(-6*cl1.x+
                    cl1.x*3*t))+t2*(cl2.x*3-cl2.x*3*t)+
                    cl3.x * t3;

                point.y=(
                        cl0.y+t*(-cl0.y*3+t*(3*cl0.y-
                        cl0.y*t)))+t*(3*cl1.y+t*(-6*cl1.y+
                        cl1.y*3*t))+t2*(cl2.y*3-cl2.y*3*t)+
                        cl3.y * t3;

                return point;
            },
            /**
             * Solves a quadric Bezier.
             * @param point {CAAT.Point} the point to store the solved value on the curve.
             * @param t {number} the value to solve the curve for.
             */
            solveQuadric : function(point,t) {
                var cl= this.coordlist;
                var cl0= cl[0];
                var cl1= cl[1];
                var cl2= cl[2];
                var t1= 1-t;

                point.x= t1*t1*cl0.x + 2*t1*t*cl1.x + t*t*cl2.x;
                point.y= t1*t1*cl0.y + 2*t1*t*cl1.y + t*t*cl2.y;

                return point;
            }
        }
    }
});
CAAT.Module({

    /**
     * @name CatmullRom
     * @memberOf CAAT.Math
     * @extends CAAT.Math.Curve
     * @constructor
     */

    defines:"CAAT.Math.CatmullRom",
    depends:["CAAT.Math.Curve"],
    extendsClass:"CAAT.Math.Curve",
    aliases:["CAAT.CatmullRom"],
    extendsWith:function () {
        return {

            /**
             * @lends CAAT.Math.CatmullRom.prototype
             */

            /**
             * Set curve control points.
             * @param p0 <CAAT.Point>
             * @param p1 <CAAT.Point>
             * @param p2 <CAAT.Point>
             * @param p3 <CAAT.Point>
             */
            setCurve:function (p0, p1, p2, p3) {

                this.coordlist = [];
                this.coordlist.push(p0);
                this.coordlist.push(p1);
                this.coordlist.push(p2);
                this.coordlist.push(p3);

                this.update();

                return this;
            },
            /**
             * Paint the contour by solving again the entire curve.
             * @param director {CAAT.Director}
             */
            paint:function (director) {

                var x1, y1;

                // Catmull rom solves from point 1 !!!

                x1 = this.coordlist[1].x;
                y1 = this.coordlist[1].y;

                var ctx = director.ctx;

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x1, y1);

                var point = new CAAT.Point();

                for (var t = this.k; t <= 1 + this.k; t += this.k) {
                    this.solve(point, t);
                    ctx.lineTo(point.x, point.y);
                }

                ctx.stroke();
                ctx.restore();

                CAAT.Math.CatmullRom.superclass.paint.call(this, director);
            },
            /**
             * Solves the curve for any given parameter t.
             * @param point {CAAT.Point} the point to store the solved value on the curve.
             * @param t {number} a number in the range 0..1
             */
            solve:function (point, t) {
                var c = this.coordlist;

                // Handy from CAKE. Thanks.
                var af = ((-t + 2) * t - 1) * t * 0.5
                var bf = (((3 * t - 5) * t) * t + 2) * 0.5
                var cf = ((-3 * t + 4) * t + 1) * t * 0.5
                var df = ((t - 1) * t * t) * 0.5

                point.x = c[0].x * af + c[1].x * bf + c[2].x * cf + c[3].x * df;
                point.y = c[0].y * af + c[1].y * bf + c[2].y * cf + c[3].y * df;

                return point;

            },

            applyAsPath:function (director) {

                var ctx = director.ctx;

                var point = new CAAT.Math.Point();

                for (var t = this.k; t <= 1 + this.k; t += this.k) {
                    this.solve(point, t);
                    ctx.lineTo(point.x, point.y);
                }

                return this;
            },

            /**
             * Return the first curve control point.
             * @return {CAAT.Point}
             */
            endCurvePosition:function () {
                return this.coordlist[ this.coordlist.length - 2 ];
            },
            /**
             * Return the last curve control point.
             * @return {CAAT.Point}
             */
            startCurvePosition:function () {
                return this.coordlist[ 1 ];
            }
        }
    }
});
/**
 * See LICENSE file.
 *
 **/

CAAT.Module({

    /**
     * @name Curve
     * @memberOf CAAT.Math
     * @constructor
     */

    defines:"CAAT.Math.Curve",
    depends:["CAAT.Math.Point"],
    extendsWith:function () {

        return {

            /**
             * @lends CAAT.Math.Curve.prototype
             */

            /**
             * A collection of CAAT.Math.Point objects.
             */
            coordlist:null,

            /**
             * Minimun solver step.
             */
            k:0.05,

            /**
             * Curve length.
             */
            length:-1,

            /**
             * If this segments belongs to an interactive path, the handlers will be this size.
             */
            HANDLE_SIZE:20,

            /**
             * Draw interactive handlers ?
             */
            drawHandles:true,

            /**
             * Paint the curve control points.
             * @param director {CAAT.Director}
             */
            paint:function (director) {
                if (false === this.drawHandles) {
                    return;
                }

                var cl = this.coordlist;
                var ctx = director.ctx;

                // control points
                ctx.save();
                ctx.beginPath();

                ctx.strokeStyle = '#a0a0a0';
                ctx.moveTo(cl[0].x, cl[0].y);
                ctx.lineTo(cl[1].x, cl[1].y);
                ctx.stroke();
                if (this.cubic) {
                    ctx.moveTo(cl[2].x, cl[2].y);
                    ctx.lineTo(cl[3].x, cl[3].y);
                    ctx.stroke();
                }


                ctx.globalAlpha = 0.5;
                for (var i = 0; i < this.coordlist.length; i++) {
                    ctx.fillStyle = '#7f7f00';
                    var w = this.HANDLE_SIZE / 2;
                    ctx.beginPath();
                    ctx.arc(cl[i].x, cl[i].y, w, 0, 2 * Math.PI, false);
                    ctx.fill();
                }

                ctx.restore();
            },
            /**
             * Signal the curve has been modified and recalculate curve length.
             */
            update:function () {
                this.calcLength();
            },
            /**
             * This method must be overriden by subclasses. It is called whenever the curve must be solved for some time=t.
             * The t parameter must be in the range 0..1
             * @param point {CAAT.Point} to store curve solution for t.
             * @param t {number}
             * @return {CAAT.Point} the point parameter.
             */
            solve:function (point, t) {
            },
            /**
             * Get an array of points defining the curve contour.
             * @param numSamples {number} number of segments to get.
             */
            getContour:function (numSamples) {
                var contour = [], i;

                for (i = 0; i <= numSamples; i++) {
                    var point = new CAAT.Math.Point();
                    this.solve(point, i / numSamples);
                    contour.push(point);
                }

                return contour;
            },
            /**
             * Calculates a curve bounding box.
             *
             * @param rectangle {CAAT.Rectangle} a rectangle to hold the bounding box.
             * @return {CAAT.Rectangle} the rectangle parameter.
             */
            getBoundingBox:function (rectangle) {
                if (!rectangle) {
                    rectangle = new CAAT.Math.Rectangle();
                }

                // thanks yodesoft.com for spotting the first point is out of the BB
                rectangle.setEmpty();
                rectangle.union(this.coordlist[0].x, this.coordlist[0].y);

                var pt = new CAAT.Math.Point();
                for (var t = this.k; t <= 1 + this.k; t += this.k) {
                    this.solve(pt, t);
                    rectangle.union(pt.x, pt.y);
                }

                return rectangle;
            },
            /**
             * Calculate the curve length by incrementally solving the curve every substep=CAAT.Curve.k. This value defaults
             * to .05 so at least 20 iterations will be performed.
             *
             * @return {number} the approximate curve length.
             */
            calcLength:function () {
                var x1, y1;
                x1 = this.coordlist[0].x;
                y1 = this.coordlist[0].y;
                var llength = 0;
                var pt = new CAAT.Math.Point();
                for (var t = this.k; t <= 1 + this.k; t += this.k) {
                    this.solve(pt, t);
                    llength += Math.sqrt((pt.x - x1) * (pt.x - x1) + (pt.y - y1) * (pt.y - y1));
                    x1 = pt.x;
                    y1 = pt.y;
                }

                this.length = llength;
                return llength;
            },
            /**
             * Return the cached curve length.
             * @return {number} the cached curve length.
             */
            getLength:function () {
                return this.length;
            },
            /**
             * Return the first curve control point.
             * @return {CAAT.Point}
             */
            endCurvePosition:function () {
                return this.coordlist[ this.coordlist.length - 1 ];
            },
            /**
             * Return the last curve control point.
             * @return {CAAT.Point}
             */
            startCurvePosition:function () {
                return this.coordlist[ 0 ];
            },

            setPoints:function (points) {
            },

            setPoint:function (point, index) {
                if (index >= 0 && index < this.coordlist.length) {
                    this.coordlist[index] = point;
                }
            },
            /**
             *
             * @param director <=CAAT.Director>
             */
            applyAsPath:function (director) {
            }
        }
    }

});

CAAT.Module({

    /**
     * @name Dimension
     * @memberOf CAAT.Math
     * @constructor
     */


    defines:"CAAT.Math.Dimension",
    aliases:["CAAT.Dimension"],
    extendsWith:function () {
        return {

            /**
             * @lends CAAT.Math.Dimension.prototype
             */

            /**
             * Width dimension.
             */
            width:0,

            /**
             * Height dimension.
             */
            height:0,

            __init:function (w, h) {
                this.width = w;
                this.height = h;
                return this;
            }
        }
    }
});
/**
 * See LICENSE file.
 *
 **/


CAAT.Module({

    /**
     * @name Matrix
     * @memberOf CAAT.Math
     * @constructor
     */


    defines:"CAAT.Math.Matrix",
    depends:["CAAT.Math.Point"],
    aliases:["CAAT.Matrix"],
    onCreate : function() {
        CAAT.Math.Matrix.prototype.transformRenderingContext= CAAT.Math.Matrix.prototype.transformRenderingContext_NoClamp;
        CAAT.Math.Matrix.prototype.transformRenderingContextSet= CAAT.Math.Matrix.prototype.transformRenderingContextSet_NoClamp;
    },
    constants : {

        /**
         * @lends CAAT.Math.Matrix.prototype
         */

        setCoordinateClamping : function( clamp ) {
            if ( clamp ) {
                CAAT.Matrix.prototype.transformRenderingContext= CAAT.Matrix.prototype.transformRenderingContext_Clamp;
                CAAT.Matrix.prototype.transformRenderingContextSet= CAAT.Matrix.prototype.transformRenderingContextSet_Clamp;
                CAAT.Math.Matrix.prototype.transformRenderingContext= CAAT.Matrix.prototype.transformRenderingContext_Clamp;
                CAAT.Math.Matrix.prototype.transformRenderingContextSet= CAAT.Matrix.prototype.transformRenderingContextSet_Clamp;
            } else {
                CAAT.Matrix.prototype.transformRenderingContext= CAAT.Matrix.prototype.transformRenderingContext_NoClamp;
                CAAT.Matrix.prototype.transformRenderingContextSet= CAAT.Matrix.prototype.transformRenderingContextSet_NoClamp;
                CAAT.Math.Matrix.prototype.transformRenderingContext= CAAT.Matrix.prototype.transformRenderingContext_NoClamp;
                CAAT.Math.Matrix.prototype.transformRenderingContextSet= CAAT.Matrix.prototype.transformRenderingContextSet_NoClamp;
            }
        },
        /**
         * Create a scale matrix.
         * @param scalex {number} x scale magnitude.
         * @param scaley {number} y scale magnitude.
         *
         * @return {CAAT.Matrix} a matrix object.
         *
         * @static
         */
        scale:function (scalex, scaley) {
            var m = new CAAT.Math.Matrix();

            m.matrix[0] = scalex;
            m.matrix[4] = scaley;

            return m;
        },
        /**
         * Create a new rotation matrix and set it up for the specified angle in radians.
         * @param angle {number}
         * @return {CAAT.Matrix} a matrix object.
         *
         * @static
         */
        rotate:function (angle) {
            var m = new CAAT.Math.Matrix();
            m.setRotation(angle);
            return m;
        },
        /**
         * Create a translation matrix.
         * @param x {number} x translation magnitude.
         * @param y {number} y translation magnitude.
         *
         * @return {CAAT.Matrix} a matrix object.
         * @static
         *
         */
        translate:function (x, y) {
            var m = new CAAT.Math.Matrix();

            m.matrix[2] = x;
            m.matrix[5] = y;

            return m;
        }
    },
    extendsWith:function () {
        return {

            /**
             * @lends CAAT.Math.Matrix.prototype
             */

            /**
             * An array of 9 numbers.
             */
            matrix:null,

            __init:function () {
                this.matrix = [
                    1.0, 0.0, 0.0,
                    0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ];

                if (typeof Float32Array !== "undefined") {
                    this.matrix = new Float32Array(this.matrix);
                }

                return this;
            },

            /**
             * Transform a point by this matrix. The parameter point will be modified with the transformation values.
             * @param point {CAAT.Point}.
             * @return {CAAT.Point} the parameter point.
             */
            transformCoord:function (point) {
                var x = point.x;
                var y = point.y;

                var tm = this.matrix;

                point.x = x * tm[0] + y * tm[1] + tm[2];
                point.y = x * tm[3] + y * tm[4] + tm[5];

                return point;
            },

            setRotation:function (angle) {

                this.identity();

                var tm = this.matrix;
                var c = Math.cos(angle);
                var s = Math.sin(angle);
                tm[0] = c;
                tm[1] = -s;
                tm[3] = s;
                tm[4] = c;

                return this;
            },

            setScale:function (scalex, scaley) {
                this.identity();

                this.matrix[0] = scalex;
                this.matrix[4] = scaley;

                return this;
            },

            /**
             * Sets this matrix as a translation matrix.
             * @param x
             * @param y
             */
            setTranslate:function (x, y) {
                this.identity();

                this.matrix[2] = x;
                this.matrix[5] = y;

                return this;
            },
            /**
             * Copy into this matrix the given matrix values.
             * @param matrix {CAAT.Matrix}
             * @return this
             */
            copy:function (matrix) {
                matrix = matrix.matrix;

                var tmatrix = this.matrix;
                tmatrix[0] = matrix[0];
                tmatrix[1] = matrix[1];
                tmatrix[2] = matrix[2];
                tmatrix[3] = matrix[3];
                tmatrix[4] = matrix[4];
                tmatrix[5] = matrix[5];
                tmatrix[6] = matrix[6];
                tmatrix[7] = matrix[7];
                tmatrix[8] = matrix[8];

                return this;
            },
            /**
             * Set this matrix to the identity matrix.
             * @return this
             */
            identity:function () {

                var m = this.matrix;
                m[0] = 1.0;
                m[1] = 0.0;
                m[2] = 0.0;

                m[3] = 0.0;
                m[4] = 1.0;
                m[5] = 0.0;

                m[6] = 0.0;
                m[7] = 0.0;
                m[8] = 1.0;

                return this;
            },
            /**
             * Multiply this matrix by a given matrix.
             * @param m {CAAT.Matrix}
             * @return this
             */
            multiply:function (m) {

                var tm = this.matrix;
                var mm = m.matrix;

                var tm0 = tm[0];
                var tm1 = tm[1];
                var tm2 = tm[2];
                var tm3 = tm[3];
                var tm4 = tm[4];
                var tm5 = tm[5];
                var tm6 = tm[6];
                var tm7 = tm[7];
                var tm8 = tm[8];

                var mm0 = mm[0];
                var mm1 = mm[1];
                var mm2 = mm[2];
                var mm3 = mm[3];
                var mm4 = mm[4];
                var mm5 = mm[5];
                var mm6 = mm[6];
                var mm7 = mm[7];
                var mm8 = mm[8];

                tm[0] = tm0 * mm0 + tm1 * mm3 + tm2 * mm6;
                tm[1] = tm0 * mm1 + tm1 * mm4 + tm2 * mm7;
                tm[2] = tm0 * mm2 + tm1 * mm5 + tm2 * mm8;
                tm[3] = tm3 * mm0 + tm4 * mm3 + tm5 * mm6;
                tm[4] = tm3 * mm1 + tm4 * mm4 + tm5 * mm7;
                tm[5] = tm3 * mm2 + tm4 * mm5 + tm5 * mm8;
                tm[6] = tm6 * mm0 + tm7 * mm3 + tm8 * mm6;
                tm[7] = tm6 * mm1 + tm7 * mm4 + tm8 * mm7;
                tm[8] = tm6 * mm2 + tm7 * mm5 + tm8 * mm8;

                return this;
            },
            /**
             * Premultiply this matrix by a given matrix.
             * @param m {CAAT.Matrix}
             * @return this
             */
            premultiply:function (m) {

                var m00 = m.matrix[0] * this.matrix[0] + m.matrix[1] * this.matrix[3] + m.matrix[2] * this.matrix[6];
                var m01 = m.matrix[0] * this.matrix[1] + m.matrix[1] * this.matrix[4] + m.matrix[2] * this.matrix[7];
                var m02 = m.matrix[0] * this.matrix[2] + m.matrix[1] * this.matrix[5] + m.matrix[2] * this.matrix[8];

                var m10 = m.matrix[3] * this.matrix[0] + m.matrix[4] * this.matrix[3] + m.matrix[5] * this.matrix[6];
                var m11 = m.matrix[3] * this.matrix[1] + m.matrix[4] * this.matrix[4] + m.matrix[5] * this.matrix[7];
                var m12 = m.matrix[3] * this.matrix[2] + m.matrix[4] * this.matrix[5] + m.matrix[5] * this.matrix[8];

                var m20 = m.matrix[6] * this.matrix[0] + m.matrix[7] * this.matrix[3] + m.matrix[8] * this.matrix[6];
                var m21 = m.matrix[6] * this.matrix[1] + m.matrix[7] * this.matrix[4] + m.matrix[8] * this.matrix[7];
                var m22 = m.matrix[6] * this.matrix[2] + m.matrix[7] * this.matrix[5] + m.matrix[8] * this.matrix[8];

                this.matrix[0] = m00;
                this.matrix[1] = m01;
                this.matrix[2] = m02;

                this.matrix[3] = m10;
                this.matrix[4] = m11;
                this.matrix[5] = m12;

                this.matrix[6] = m20;
                this.matrix[7] = m21;
                this.matrix[8] = m22;


                return this;
            },
            /**
             * Creates a new inverse matrix from this matrix.
             * @return {CAAT.Matrix} an inverse matrix.
             */
            getInverse:function () {
                var tm = this.matrix;

                var m00 = tm[0];
                var m01 = tm[1];
                var m02 = tm[2];
                var m10 = tm[3];
                var m11 = tm[4];
                var m12 = tm[5];
                var m20 = tm[6];
                var m21 = tm[7];
                var m22 = tm[8];

                var newMatrix = new CAAT.Math.Matrix();

                var determinant = m00 * (m11 * m22 - m21 * m12) - m10 * (m01 * m22 - m21 * m02) + m20 * (m01 * m12 - m11 * m02);
                if (determinant === 0) {
                    return null;
                }

                var m = newMatrix.matrix;

                m[0] = m11 * m22 - m12 * m21;
                m[1] = m02 * m21 - m01 * m22;
                m[2] = m01 * m12 - m02 * m11;

                m[3] = m12 * m20 - m10 * m22;
                m[4] = m00 * m22 - m02 * m20;
                m[5] = m02 * m10 - m00 * m12;

                m[6] = m10 * m21 - m11 * m20;
                m[7] = m01 * m20 - m00 * m21;
                m[8] = m00 * m11 - m01 * m10;

                newMatrix.multiplyScalar(1 / determinant);

                return newMatrix;
            },
            /**
             * Multiply this matrix by a scalar.
             * @param scalar {number} scalar value
             *
             * @return this
             */
            multiplyScalar:function (scalar) {
                var i;

                for (i = 0; i < 9; i++) {
                    this.matrix[i] *= scalar;
                }

                return this;
            },

            /**
             *
             * @param ctx
             */
            transformRenderingContextSet_NoClamp:function (ctx) {
                var m = this.matrix;
                ctx.setTransform(m[0], m[3], m[1], m[4], m[2], m[5]);
                return this;
            },

            /**
             *
             * @param ctx
             */
            transformRenderingContext_NoClamp:function (ctx) {
                var m = this.matrix;
                ctx.transform(m[0], m[3], m[1], m[4], m[2], m[5]);
                return this;
            },

            /**
             *
             * @param ctx
             */
            transformRenderingContextSet_Clamp:function (ctx) {
                var m = this.matrix;
                ctx.setTransform(m[0], m[3], m[1], m[4], m[2] >> 0, m[5] >> 0);
                return this;
            },

            /**
             *
             * @param ctx
             */
            transformRenderingContext_Clamp:function (ctx) {
                var m = this.matrix;
                ctx.transform(m[0], m[3], m[1], m[4], m[2] >> 0, m[5] >> 0);
                return this;
            },

            setModelViewMatrix:function ( x, y, sx, sy, r  ) {
                var c, s, _m00, _m01, _m10, _m11;
                var mm0, mm1, mm2, mm3, mm4, mm5;
                var mm;

                mm = this.matrix;

                mm0 = 1;
                mm1 = 0;
                mm3 = 0;
                mm4 = 1;

                mm2 = x;
                mm5 = y;

                c = Math.cos(r);
                s = Math.sin(r);
                _m00 = mm0;
                _m01 = mm1;
                _m10 = mm3;
                _m11 = mm4;
                mm0 = _m00 * c + _m01 * s;
                mm1 = -_m00 * s + _m01 * c;
                mm3 = _m10 * c + _m11 * s;
                mm4 = -_m10 * s + _m11 * c;

                mm0 = mm0 * this.scaleX;
                mm1 = mm1 * this.scaleY;
                mm3 = mm3 * this.scaleX;
                mm4 = mm4 * this.scaleY;

                mm[0] = mm0;
                mm[1] = mm1;
                mm[2] = mm2;
                mm[3] = mm3;
                mm[4] = mm4;
                mm[5] = mm5;
            }
        }
    }
});
/**
 * See LICENSE file.
 *
 **/

CAAT.Module({

    /**
     * @name Matrix3
     * @memberOf CAAT.Math
     * @constructor
     */

    defines:"CAAT.Math.Matrix3",
    aliases:["CAAT.Matrix3"],
    extendsWith:function () {
        return {

            /**
             * @lends CAAT.Math.Matrix3.prototype
             */

            /**
             * An Array of 4 Array of 4 numbers.
             */
            matrix:null,

            /**
             * An array of 16 numbers.
             */
            fmatrix:null,

            __init:function () {
                this.matrix = [
                    [1, 0, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, 1, 0],
                    [0, 0, 0, 1]
                ];

                this.fmatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

                return this;
            },

            transformCoord:function (point) {
                var x = point.x;
                var y = point.y;
                var z = point.z;

                point.x = x * this.matrix[0][0] + y * this.matrix[0][1] + z * this.matrix[0][2] + this.matrix[0][3];
                point.y = x * this.matrix[1][0] + y * this.matrix[1][1] + z * this.matrix[1][2] + this.matrix[1][3];
                point.z = x * this.matrix[2][0] + y * this.matrix[2][1] + z * this.matrix[2][2] + this.matrix[2][3];

                return point;
            },
            initialize:function (x0, y0, z0, x1, y1, z1, x2, y2, z2) {
                this.identity();
                this.matrix[0][0] = x0;
                this.matrix[0][1] = y0;
                this.matrix[0][2] = z0;

                this.matrix[1][0] = x1;
                this.matrix[1][1] = y1;
                this.matrix[1][2] = z1;

                this.matrix[2][0] = x2;
                this.matrix[2][1] = y2;
                this.matrix[2][2] = z2;

                return this;
            },
            initWithMatrix:function (matrixData) {
                this.matrix = matrixData;
                return this;
            },
            flatten:function () {
                var d = this.fmatrix;
                var s = this.matrix;
                d[ 0] = s[0][0];
                d[ 1] = s[1][0];
                d[ 2] = s[2][0];
                d[ 3] = s[3][0];

                d[ 4] = s[0][1];
                d[ 5] = s[1][1];
                d[ 6] = s[2][1];
                d[ 7] = s[2][1];

                d[ 8] = s[0][2];
                d[ 9] = s[1][2];
                d[10] = s[2][2];
                d[11] = s[3][2];

                d[12] = s[0][3];
                d[13] = s[1][3];
                d[14] = s[2][3];
                d[15] = s[3][3];

                return this.fmatrix;
            },

            /**
             * Set this matrix to identity matrix.
             * @return this
             */
            identity:function () {
                for (var i = 0; i < 4; i++) {
                    for (var j = 0; j < 4; j++) {
                        this.matrix[i][j] = (i === j) ? 1.0 : 0.0;
                    }
                }

                return this;
            },
            /**
             * Get this matri'x internal representation data. The bakced structure is a 4x4 array of number.
             */
            getMatrix:function () {
                return this.matrix;
            },
            /**
             * Multiply this matrix by a created rotation matrix. The rotation matrix is set up to rotate around
             * xy axis.
             *
             * @param xy {Number} radians to rotate.
             *
             * @return this
             */
            rotateXY:function (xy) {
                return this.rotate(xy, 0, 0);
            },
            /**
             * Multiply this matrix by a created rotation matrix. The rotation matrix is set up to rotate around
             * xz axis.
             *
             * @param xz {Number} radians to rotate.
             *
             * @return this
             */
            rotateXZ:function (xz) {
                return this.rotate(0, xz, 0);
            },
            /**
             * Multiply this matrix by a created rotation matrix. The rotation matrix is set up to rotate aroind
             * yz axis.
             *
             * @param yz {Number} radians to rotate.
             *
             * @return this
             */
            rotateYZ:function (yz) {
                return this.rotate(0, 0, yz);
            },
            /**
             *
             * @param xy
             * @param xz
             * @param yz
             */
            setRotate:function (xy, xz, yz) {
                var m = this.rotate(xy, xz, yz);
                this.copy(m);
                return this;
            },
            /**
             * Creates a matrix to represent arbitrary rotations around the given planes.
             * @param xy {number} radians to rotate around xy plane.
             * @param xz {number} radians to rotate around xz plane.
             * @param yz {number} radians to rotate around yz plane.
             *
             * @return {CAAT.Matrix3} a newly allocated matrix.
             * @static
             */
            rotate:function (xy, xz, yz) {
                var res = new CAAT.Math.Matrix3();
                var s, c, m;

                if (xy !== 0) {
                    m = new CAAT.Math.Math.Matrix3();
                    s = Math.sin(xy);
                    c = Math.cos(xy);
                    m.matrix[1][1] = c;
                    m.matrix[1][2] = -s;
                    m.matrix[2][1] = s;
                    m.matrix[2][2] = c;
                    res.multiply(m);
                }

                if (xz !== 0) {
                    m = new CAAT.Math.Matrix3();
                    s = Math.sin(xz);
                    c = Math.cos(xz);
                    m.matrix[0][0] = c;
                    m.matrix[0][2] = -s;
                    m.matrix[2][0] = s;
                    m.matrix[2][2] = c;
                    res.multiply(m);
                }

                if (yz !== 0) {
                    m = new CAAT.Math.Matrix3();
                    s = Math.sin(yz);
                    c = Math.cos(yz);
                    m.matrix[0][0] = c;
                    m.matrix[0][1] = -s;
                    m.matrix[1][0] = s;
                    m.matrix[1][1] = c;
                    res.multiply(m);
                }

                return res;
            },
            /**
             * Creates a new matrix being a copy of this matrix.
             * @return {CAAT.Matrix3} a newly allocated matrix object.
             */
            getClone:function () {
                var m = new CAAT.Math.Matrix3();
                m.copy(this);
                return m;
            },
            /**
             * Multiplies this matrix by another matrix.
             *
             * @param n {CAAT.Matrix3} a CAAT.Matrix3 object.
             * @return this
             */
            multiply:function (m) {
                var n = this.getClone();

                var nm = n.matrix;
                var n00 = nm[0][0];
                var n01 = nm[0][1];
                var n02 = nm[0][2];
                var n03 = nm[0][3];

                var n10 = nm[1][0];
                var n11 = nm[1][1];
                var n12 = nm[1][2];
                var n13 = nm[1][3];

                var n20 = nm[2][0];
                var n21 = nm[2][1];
                var n22 = nm[2][2];
                var n23 = nm[2][3];

                var n30 = nm[3][0];
                var n31 = nm[3][1];
                var n32 = nm[3][2];
                var n33 = nm[3][3];

                var mm = m.matrix;
                var m00 = mm[0][0];
                var m01 = mm[0][1];
                var m02 = mm[0][2];
                var m03 = mm[0][3];

                var m10 = mm[1][0];
                var m11 = mm[1][1];
                var m12 = mm[1][2];
                var m13 = mm[1][3];

                var m20 = mm[2][0];
                var m21 = mm[2][1];
                var m22 = mm[2][2];
                var m23 = mm[2][3];

                var m30 = mm[3][0];
                var m31 = mm[3][1];
                var m32 = mm[3][2];
                var m33 = mm[3][3];

                this.matrix[0][0] = n00 * m00 + n01 * m10 + n02 * m20 + n03 * m30;
                this.matrix[0][1] = n00 * m01 + n01 * m11 + n02 * m21 + n03 * m31;
                this.matrix[0][2] = n00 * m02 + n01 * m12 + n02 * m22 + n03 * m32;
                this.matrix[0][3] = n00 * m03 + n01 * m13 + n02 * m23 + n03 * m33;

                this.matrix[1][0] = n10 * m00 + n11 * m10 + n12 * m20 + n13 * m30;
                this.matrix[1][1] = n10 * m01 + n11 * m11 + n12 * m21 + n13 * m31;
                this.matrix[1][2] = n10 * m02 + n11 * m12 + n12 * m22 + n13 * m32;
                this.matrix[1][3] = n10 * m03 + n11 * m13 + n12 * m23 + n13 * m33;

                this.matrix[2][0] = n20 * m00 + n21 * m10 + n22 * m20 + n23 * m30;
                this.matrix[2][1] = n20 * m01 + n21 * m11 + n22 * m21 + n23 * m31;
                this.matrix[2][2] = n20 * m02 + n21 * m12 + n22 * m22 + n23 * m32;
                this.matrix[2][3] = n20 * m03 + n21 * m13 + n22 * m23 + n23 * m33;

                return this;
            },
            /**
             * Pre multiplies this matrix by a given matrix.
             *
             * @param m {CAAT.Matrix3} a CAAT.Matrix3 object.
             *
             * @return this
             */
            premultiply:function (m) {
                var n = this.getClone();

                var nm = n.matrix;
                var n00 = nm[0][0];
                var n01 = nm[0][1];
                var n02 = nm[0][2];
                var n03 = nm[0][3];

                var n10 = nm[1][0];
                var n11 = nm[1][1];
                var n12 = nm[1][2];
                var n13 = nm[1][3];

                var n20 = nm[2][0];
                var n21 = nm[2][1];
                var n22 = nm[2][2];
                var n23 = nm[2][3];

                var n30 = nm[3][0];
                var n31 = nm[3][1];
                var n32 = nm[3][2];
                var n33 = nm[3][3];

                var mm = m.matrix;
                var m00 = mm[0][0];
                var m01 = mm[0][1];
                var m02 = mm[0][2];
                var m03 = mm[0][3];

                var m10 = mm[1][0];
                var m11 = mm[1][1];
                var m12 = mm[1][2];
                var m13 = mm[1][3];

                var m20 = mm[2][0];
                var m21 = mm[2][1];
                var m22 = mm[2][2];
                var m23 = mm[2][3];

                var m30 = mm[3][0];
                var m31 = mm[3][1];
                var m32 = mm[3][2];
                var m33 = mm[3][3];

                this.matrix[0][0] = n00 * m00 + n01 * m10 + n02 * m20;
                this.matrix[0][1] = n00 * m01 + n01 * m11 + n02 * m21;
                this.matrix[0][2] = n00 * m02 + n01 * m12 + n02 * m22;
                this.matrix[0][3] = n00 * m03 + n01 * m13 + n02 * m23 + n03;
                this.matrix[1][0] = n10 * m00 + n11 * m10 + n12 * m20;
                this.matrix[1][1] = n10 * m01 + n11 * m11 + n12 * m21;
                this.matrix[1][2] = n10 * m02 + n11 * m12 + n12 * m22;
                this.matrix[1][3] = n10 * m03 + n11 * m13 + n12 * m23 + n13;
                this.matrix[2][0] = n20 * m00 + n21 * m10 + n22 * m20;
                this.matrix[2][1] = n20 * m01 + n21 * m11 + n22 * m21;
                this.matrix[2][2] = n20 * m02 + n21 * m12 + n22 * m22;
                this.matrix[2][3] = n20 * m03 + n21 * m13 + n22 * m23 + n23;

                return this;
            },
            /**
             * Set this matrix translation values to be the given parameters.
             *
             * @param x {number} x component of translation point.
             * @param y {number} y component of translation point.
             * @param z {number} z component of translation point.
             *
             * @return this
             */
            setTranslate:function (x, y, z) {
                this.identity();
                this.matrix[0][3] = x;
                this.matrix[1][3] = y;
                this.matrix[2][3] = z;
                return this;
            },
            /**
             * Create a translation matrix.
             * @param x {number}
             * @param y {number}
             * @param z {number}
             * @return {CAAT.Matrix3} a new matrix.
             */
            translate:function (x, y, z) {
                var m = new CAAT.Math.Matrix3();
                m.setTranslate(x, y, z);
                return m;
            },
            setScale:function (sx, sy, sz) {
                this.identity();
                this.matrix[0][0] = sx;
                this.matrix[1][1] = sy;
                this.matrix[2][2] = sz;
                return this;
            },
            scale:function (sx, sy, sz) {
                var m = new CAAT.Math.Matrix3();
                m.setScale(sx, sy, sz);
                return m;
            },
            /**
             * Set this matrix as the rotation matrix around the given axes.
             * @param xy {number} radians of rotation around z axis.
             * @param xz {number} radians of rotation around y axis.
             * @param yz {number} radians of rotation around x axis.
             *
             * @return this
             */
            rotateModelView:function (xy, xz, yz) {
                var sxy = Math.sin(xy);
                var sxz = Math.sin(xz);
                var syz = Math.sin(yz);
                var cxy = Math.cos(xy);
                var cxz = Math.cos(xz);
                var cyz = Math.cos(yz);

                this.matrix[0][0] = cxz * cxy;
                this.matrix[0][1] = -cxz * sxy;
                this.matrix[0][2] = sxz;
                this.matrix[0][3] = 0;
                this.matrix[1][0] = syz * sxz * cxy + sxy * cyz;
                this.matrix[1][1] = cyz * cxy - syz * sxz * sxy;
                this.matrix[1][2] = -syz * cxz;
                this.matrix[1][3] = 0;
                this.matrix[2][0] = syz * sxy - cyz * sxz * cxy;
                this.matrix[2][1] = cyz * sxz * sxy + syz * cxy;
                this.matrix[2][2] = cyz * cxz;
                this.matrix[2][3] = 0;
                this.matrix[3][0] = 0;
                this.matrix[3][1] = 0;
                this.matrix[3][2] = 0;
                this.matrix[3][3] = 1;

                return this;
            },
            /**
             * Copy a given matrix values into this one's.
             * @param m {CAAT.Matrix} a matrix
             *
             * @return this
             */
            copy:function (m) {
                for (var i = 0; i < 4; i++) {
                    for (var j = 0; j < 4; j++) {
                        this.matrix[i][j] = m.matrix[i][j];
                    }
                }

                return this;
            },
            /**
             * Calculate this matrix's determinant.
             * @return {number} matrix determinant.
             */
            calculateDeterminant:function () {

                var mm = this.matrix;
                var m11 = mm[0][0], m12 = mm[0][1], m13 = mm[0][2], m14 = mm[0][3],
                    m21 = mm[1][0], m22 = mm[1][1], m23 = mm[1][2], m24 = mm[1][3],
                    m31 = mm[2][0], m32 = mm[2][1], m33 = mm[2][2], m34 = mm[2][3],
                    m41 = mm[3][0], m42 = mm[3][1], m43 = mm[3][2], m44 = mm[3][3];

                return  m14 * m22 * m33 * m41 +
                    m12 * m24 * m33 * m41 +
                    m14 * m23 * m31 * m42 +
                    m13 * m24 * m31 * m42 +

                    m13 * m21 * m34 * m42 +
                    m11 * m23 * m34 * m42 +
                    m14 * m21 * m32 * m43 +
                    m11 * m24 * m32 * m43 +

                    m13 * m22 * m31 * m44 +
                    m12 * m23 * m31 * m44 +
                    m12 * m21 * m33 * m44 +
                    m11 * m22 * m33 * m44 +

                    m14 * m23 * m32 * m41 -
                    m13 * m24 * m32 * m41 -
                    m13 * m22 * m34 * m41 -
                    m12 * m23 * m34 * m41 -

                    m14 * m21 * m33 * m42 -
                    m11 * m24 * m33 * m42 -
                    m14 * m22 * m31 * m43 -
                    m12 * m24 * m31 * m43 -

                    m12 * m21 * m34 * m43 -
                    m11 * m22 * m34 * m43 -
                    m13 * m21 * m32 * m44 -
                    m11 * m23 * m32 * m44;
            },
            /**
             * Return a new matrix which is this matrix's inverse matrix.
             * @return {CAAT.Matrix3} a new matrix.
             */
            getInverse:function () {
                var mm = this.matrix;
                var m11 = mm[0][0], m12 = mm[0][1], m13 = mm[0][2], m14 = mm[0][3],
                    m21 = mm[1][0], m22 = mm[1][1], m23 = mm[1][2], m24 = mm[1][3],
                    m31 = mm[2][0], m32 = mm[2][1], m33 = mm[2][2], m34 = mm[2][3],
                    m41 = mm[3][0], m42 = mm[3][1], m43 = mm[3][2], m44 = mm[3][3];

                var m2 = new CAAT.Math.Matrix3();
                m2.matrix[0][0] = m23 * m34 * m42 + m24 * m32 * m43 + m22 * m33 * m44 - m24 * m33 * m42 - m22 * m34 * m43 - m23 * m32 * m44;
                m2.matrix[0][1] = m14 * m33 * m42 + m12 * m34 * m43 + m13 * m32 * m44 - m12 * m33 * m44 - m13 * m34 * m42 - m14 * m32 * m43;
                m2.matrix[0][2] = m13 * m24 * m42 + m12 * m23 * m44 + m14 * m22 * m43 - m12 * m24 * m43 - m13 * m22 * m44 - m14 * m23 * m42;
                m2.matrix[0][3] = m14 * m23 * m32 + m12 * m24 * m33 + m13 * m22 * m34 - m13 * m24 * m32 - m14 * m22 * m33 - m12 * m23 * m34;

                m2.matrix[1][0] = m24 * m33 * m41 + m21 * m34 * m43 + m23 * m31 * m44 - m23 * m34 * m41 - m24 * m31 * m43 - m21 * m33 * m44;
                m2.matrix[1][1] = m13 * m34 * m41 + m14 * m31 * m43 + m11 * m33 * m44 - m14 * m33 * m41 - m11 * m34 * m43 - m13 * m31 * m44;
                m2.matrix[1][2] = m14 * m23 * m41 + m11 * m24 * m43 + m13 * m21 * m44 - m13 * m24 * m41 - m14 * m21 * m43 - m11 * m23 * m44;
                m2.matrix[1][3] = m13 * m24 * m31 + m14 * m21 * m33 + m11 * m23 * m34 - m14 * m23 * m31 - m11 * m24 * m33 - m13 * m21 * m34;

                m2.matrix[2][0] = m22 * m34 * m41 + m24 * m31 * m42 + m21 * m32 * m44 - m24 * m32 * m41 - m21 * m34 * m42 - m22 * m31 * m44;
                m2.matrix[2][1] = m14 * m32 * m41 + m11 * m34 * m42 + m12 * m31 * m44 - m11 * m32 * m44 - m12 * m34 * m41 - m14 * m31 * m42;
                m2.matrix[2][2] = m13 * m24 * m41 + m14 * m21 * m42 + m11 * m22 * m44 - m14 * m22 * m41 - m11 * m24 * m42 - m12 * m21 * m44;
                m2.matrix[2][3] = m14 * m22 * m31 + m11 * m24 * m32 + m12 * m21 * m34 - m11 * m22 * m34 - m12 * m24 * m31 - m14 * m21 * m32;

                m2.matrix[3][0] = m23 * m32 * m41 + m21 * m33 * m42 + m22 * m31 * m43 - m22 * m33 * m41 - m23 * m31 * m42 - m21 * m32 * m43;
                m2.matrix[3][1] = m12 * m33 * m41 + m13 * m31 * m42 + m11 * m32 * m43 - m13 * m32 * m41 - m11 * m33 * m42 - m12 * m31 * m43;
                m2.matrix[3][2] = m13 * m22 * m41 + m11 * m23 * m42 + m12 * m21 * m43 - m11 * m22 * m43 - m12 * m23 * m41 - m13 * m21 * m42;
                m2.matrix[3][3] = m12 * m23 * m31 + m13 * m21 * m32 + m11 * m22 * m33 - m13 * m22 * m31 - m11 * m23 * m32 - m12 * m21 * m33;

                return m2.multiplyScalar(1 / this.calculateDeterminant());
            },
            /**
             * Multiply this matrix by a scalar.
             * @param scalar {number} scalar value
             *
             * @return this
             */
            multiplyScalar:function (scalar) {
                var i, j;

                for (i = 0; i < 4; i++) {
                    for (j = 0; j < 4; j++) {
                        this.matrix[i][j] *= scalar;
                    }
                }

                return this;
            }

        }
    }

});
/**
 * See LICENSE file.
 *
 **/
CAAT.Module({

    /**
     * @name Point
     * @memberOf CAAT.Math
     * @constructor
     */

    defines:"CAAT.Math.Point",
    aliases:["CAAT.Point"],
    extendsWith:function () {
        return {

            /**
             * @lends CAAT.Math.Point.prototype
             */


            /**
             * point x coordinate.
             */
            x:0,

            /**
             * point y coordinate.
             */
            y:0,

            /**
             * point z coordinate.
             */
            z:0,

            __init:function (xpos, ypos, zpos) {
                this.x = xpos;
                this.y = ypos;
                this.z = zpos || 0;
                return this;
            },

            /**
             * Sets this point coordinates.
             * @param x {number}
             * @param y {number}
             * @param z {number=}
             *
             * @return this
             */
            set:function (x, y, z) {
                this.x = x;
                this.y = y;
                this.z = z || 0;
                return this;
            },
            /**
             * Create a new CAAT.Point equal to this one.
             * @return {CAAT.Point}
             */
            clone:function () {
                var p = new CAAT.Math.Point(this.x, this.y, this.z);
                return p;
            },
            /**
             * Translate this point to another position. The final point will be (point.x+x, point.y+y)
             * @param x {number}
             * @param y {number}
             *
             * @return this
             */
            translate:function (x, y, z) {
                this.x += x;
                this.y += y;
                this.z += z;

                return this;
            },
            /**
             * Translate this point to another point.
             * @param aPoint {CAAT.Point}
             * @return this
             */
            translatePoint:function (aPoint) {
                this.x += aPoint.x;
                this.y += aPoint.y;
                this.z += aPoint.z;
                return this;
            },
            /**
             * Substract a point from this one.
             * @param aPoint {CAAT.Point}
             * @return this
             */
            subtract:function (aPoint) {
                this.x -= aPoint.x;
                this.y -= aPoint.y;
                this.z -= aPoint.z;
                return this;
            },
            /**
             * Multiply this point by a scalar.
             * @param factor {number}
             * @return this
             */
            multiply:function (factor) {
                this.x *= factor;
                this.y *= factor;
                this.z *= factor;
                return this;
            },
            /**
             * Rotate this point by an angle. The rotation is held by (0,0) coordinate as center.
             * @param angle {number}
             * @return this
             */
            rotate:function (angle) {
                var x = this.x, y = this.y;
                this.x = x * Math.cos(angle) - Math.sin(angle) * y;
                this.y = x * Math.sin(angle) + Math.cos(angle) * y;
                this.z = 0;
                return this;
            },
            /**
             *
             * @param angle {number}
             * @return this
             */
            setAngle:function (angle) {
                var len = this.getLength();
                this.x = Math.cos(angle) * len;
                this.y = Math.sin(angle) * len;
                this.z = 0;
                return this;
            },
            /**
             *
             * @param length {number}
             * @return this
             */
            setLength:function (length) {
                var len = this.getLength();
                if (len)this.multiply(length / len);
                else this.x = this.y = this.z = length;
                return this;
            },
            /**
             * Normalize this point, that is, both set coordinates proportionally to values raning 0..1
             * @return this
             */
            normalize:function () {
                var len = this.getLength();
                this.x /= len;
                this.y /= len;
                this.z /= len;
                return this;
            },
            /**
             * Return the angle from -Pi to Pi of this point.
             * @return {number}
             */
            getAngle:function () {
                return Math.atan2(this.y, this.x);
            },
            /**
             * Set this point coordinates proportinally to a maximum value.
             * @param max {number}
             * @return this
             */
            limit:function (max) {
                var aLenthSquared = this.getLengthSquared();
                if (aLenthSquared + 0.01 > max * max) {
                    var aLength = Math.sqrt(aLenthSquared);
                    this.x = (this.x / aLength) * max;
                    this.y = (this.y / aLength) * max;
                    this.z = (this.z / aLength) * max;
                }
                return this;
            },
            /**
             * Get this point's lenght.
             * @return {number}
             */
            getLength:function () {
                var length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
                if (length < 0.005 && length > -0.005) return 0.000001;
                return length;

            },
            /**
             * Get this point's squared length.
             * @return {number}
             */
            getLengthSquared:function () {
                var lengthSquared = this.x * this.x + this.y * this.y + this.z * this.z;
                if (lengthSquared < 0.005 && lengthSquared > -0.005) return 0;
                return lengthSquared;
            },
            /**
             * Get the distance between two points.
             * @param point {CAAT.Point}
             * @return {number}
             */
            getDistance:function (point) {
                var deltaX = this.x - point.x;
                var deltaY = this.y - point.y;
                var deltaZ = this.z - point.z;
                return Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
            },
            /**
             * Get the squared distance between two points.
             * @param point {CAAT.Point}
             * @return {number}
             */
            getDistanceSquared:function (point) {
                var deltaX = this.x - point.x;
                var deltaY = this.y - point.y;
                var deltaZ = this.z - point.z;
                return deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ;
            },
            /**
             * Get a string representation.
             * @return {string}
             */
            toString:function () {
                return "(CAAT.Math.Point)" +
                    " x:" + String(Math.round(Math.floor(this.x * 10)) / 10) +
                    " y:" + String(Math.round(Math.floor(this.y * 10)) / 10) +
                    " z:" + String(Math.round(Math.floor(this.z * 10)) / 10);
            }
        }
    }
});
/**
 * See LICENSE file.
 *
 */


CAAT.Module( {

    /**
     * @name Rectangle
     * @memberOf CAAT.Math
     * @constructor
     */


    defines:        "CAAT.Math.Rectangle",
    aliases:        ["CAAT.Rectangle"],
    extendsWith:    function() {
        return {

            /**
             * @lends CAAT.Math.Rectangle.prototype
             */

            __init : function( x,y,w,h ) {
                if ( arguments.length!==4 ) {
                    this.setEmpty();
                } else {
                    this.setLocation(x,y);
                    this.setDimension(w,h);
                }
            },

            /**
             * Rectangle x position.
             */
            x:		0,

            /**
             * Rectangle y position.
             */
            y:		0,

            /**
             * Rectangle x1 position.
             */
            x1:		0,

            /**
             * Rectangle y1 position.
             */
            y1:		0,

            /**
             * Rectangle width.
             */
            width:	-1,

            /**
             * Rectangle height.
             */
            height:	-1,

            setEmpty : function() {
                this.width=     -1;
                this.height=    -1;
                this.x=         0;
                this.y=         0;
                this.x1=        0;
                this.y1=        0;
                return this;
            },
            /**
             * Set this rectangle's location.
             * @param x {number}
             * @param y {number}
             */
            setLocation: function( x,y ) {
                this.x= x;
                this.y= y;
                this.x1= this.x+this.width;
                this.y1= this.y+this.height;
                return this;
            },
            /**
             * Set this rectangle's dimension.
             * @param w {number}
             * @param h {number}
             */
            setDimension : function( w,h ) {
                this.width= w;
                this.height= h;
                this.x1= this.x+this.width;
                this.y1= this.y+this.height;
                return this;
            },
            setBounds : function( x,y,w,h ) {
                this.setLocation( x, y );
                this.setDimension( w, h );
                return this;
            },
            /**
             * Return whether the coordinate is inside this rectangle.
             * @param px {number}
             * @param py {number}
             *
             * @return {boolean}
             */
            contains : function(px,py) {
                //return px>=0 && px<this.width && py>=0 && py<this.height;
                return px>=this.x && px<this.x1 && py>=this.y && py<this.y1;
            },
            /**
             * Return whether this rectangle is empty, that is, has zero dimension.
             * @return {boolean}
             */
            isEmpty : function() {
                return this.width===-1 && this.height===-1;
            },
            /**
             * Set this rectangle as the union of this rectangle and the given point.
             * @param px {number}
             * @param py {number}
             */
            union : function(px,py) {

                if ( this.isEmpty() ) {
                    this.x= px;
                    this.x1= px;
                    this.y= py;
                    this.y1= py;
                    this.width=0;
                    this.height=0;
                    return;
                }

                this.x1= this.x+this.width;
                this.y1= this.y+this.height;

                if ( py<this.y ) {
                    this.y= py;
                }
                if ( px<this.x ) {
                    this.x= px;
                }
                if ( py>this.y1 ) {
                    this.y1= py;
                }
                if ( px>this.x1 ){
                    this.x1= px;
                }

                this.width= this.x1-this.x;
                this.height= this.y1-this.y;
            },
            unionRectangle : function( rectangle ) {
                this.union( rectangle.x , rectangle.y  );
                this.union( rectangle.x1, rectangle.y  );
                this.union( rectangle.x,  rectangle.y1 );
                this.union( rectangle.x1, rectangle.y1 );
                return this;
            },
            intersects : function( r ) {
                if ( r.isEmpty() || this.isEmpty() ) {
                    return false;
                }

                if ( r.x1<= this.x ) {
                    return false;
                }
                if ( r.x >= this.x1 ) {
                    return false;
                }
                if ( r.y1<= this.y ) {
                    return false;
                }

                return r.y < this.y1;
            },

            intersectsRect : function( x,y,w,h ) {
                if ( -1===w || -1===h ) {
                    return false;
                }

                var x1= x+w-1;
                var y1= y+h-1;

                if ( x1< this.x ) {
                    return false;
                }
                if ( x > this.x1 ) {
                    return false;
                }
                if ( y1< this.y ) {
                    return false;
                }
                return y <= this.y1;

            },

            intersect : function( i, r ) {
                if ( typeof r==='undefined' ) {
                    r= new CAAT.Math.Rectangle();
                }

                r.x= Math.max( this.x, i.x );
                r.y= Math.max( this.y, i.y );
                r.x1=Math.min( this.x1, i.x1 );
                r.y1=Math.min( this.y1, i.y1 );
                r.width= r.x1-r.x;
                r.height=r.y1-r.y;

                return r;
            }
        }
	}
});
/**
 * See LICENSE file.
 *
 * Partially based on Robert Penner easing equations.
 * http://www.robertpenner.com/easing/
 *
 *
 **/

CAAT.Module({

    /**
     * @name Interpolator
     * @memberOf CAAT.Behavior
     * @constructor
     */

    defines:"CAAT.Behavior.Interpolator",
    depends:["CAAT.Math.Point"],
    aliases:["CAAT.Interpolator"],
    constants : {
        /**
         * @lends CAAT.Behavior.Interpolator
         */

        enumerateInterpolators: function () {
            return [
                new CAAT.Behavior.Interpolator().createLinearInterpolator(false, false), 'Linear pingpong=false, inverse=false',
                new CAAT.Behavior.Interpolator().createLinearInterpolator(true, false), 'Linear pingpong=true, inverse=false',

                new CAAT.Behavior.Interpolator().createBackOutInterpolator(false), 'BackOut pingpong=true, inverse=false',
                new CAAT.Behavior.Interpolator().createBackOutInterpolator(true), 'BackOut pingpong=true, inverse=true',

                new CAAT.Behavior.Interpolator().createLinearInterpolator(false, true), 'Linear pingpong=false, inverse=true',
                new CAAT.Behavior.Interpolator().createLinearInterpolator(true, true), 'Linear pingpong=true, inverse=true',

                new CAAT.Behavior.Interpolator().createExponentialInInterpolator(2, false), 'ExponentialIn pingpong=false, exponent=2',
                new CAAT.Behavior.Interpolator().createExponentialOutInterpolator(2, false), 'ExponentialOut pingpong=false, exponent=2',
                new CAAT.Behavior.Interpolator().createExponentialInOutInterpolator(2, false), 'ExponentialInOut pingpong=false, exponent=2',
                new CAAT.Behavior.Interpolator().createExponentialInInterpolator(2, true), 'ExponentialIn pingpong=true, exponent=2',
                new CAAT.Behavior.Interpolator().createExponentialOutInterpolator(2, true), 'ExponentialOut pingpong=true, exponent=2',
                new CAAT.Behavior.Interpolator().createExponentialInOutInterpolator(2, true), 'ExponentialInOut pingpong=true, exponent=2',

                new CAAT.Behavior.Interpolator().createExponentialInInterpolator(4, false), 'ExponentialIn pingpong=false, exponent=4',
                new CAAT.Behavior.Interpolator().createExponentialOutInterpolator(4, false), 'ExponentialOut pingpong=false, exponent=4',
                new CAAT.Behavior.Interpolator().createExponentialInOutInterpolator(4, false), 'ExponentialInOut pingpong=false, exponent=4',
                new CAAT.Behavior.Interpolator().createExponentialInInterpolator(4, true), 'ExponentialIn pingpong=true, exponent=4',
                new CAAT.Behavior.Interpolator().createExponentialOutInterpolator(4, true), 'ExponentialOut pingpong=true, exponent=4',
                new CAAT.Behavior.Interpolator().createExponentialInOutInterpolator(4, true), 'ExponentialInOut pingpong=true, exponent=4',

                new CAAT.Behavior.Interpolator().createExponentialInInterpolator(6, false), 'ExponentialIn pingpong=false, exponent=6',
                new CAAT.Behavior.Interpolator().createExponentialOutInterpolator(6, false), 'ExponentialOut pingpong=false, exponent=6',
                new CAAT.Behavior.Interpolator().createExponentialInOutInterpolator(6, false), 'ExponentialInOut pingpong=false, exponent=6',
                new CAAT.Behavior.Interpolator().createExponentialInInterpolator(6, true), 'ExponentialIn pingpong=true, exponent=6',
                new CAAT.Behavior.Interpolator().createExponentialOutInterpolator(6, true), 'ExponentialOut pingpong=true, exponent=6',
                new CAAT.Behavior.Interpolator().createExponentialInOutInterpolator(6, true), 'ExponentialInOut pingpong=true, exponent=6',

                new CAAT.Behavior.Interpolator().createBounceInInterpolator(false), 'BounceIn pingpong=false',
                new CAAT.Behavior.Interpolator().createBounceOutInterpolator(false), 'BounceOut pingpong=false',
                new CAAT.Behavior.Interpolator().createBounceInOutInterpolator(false), 'BounceInOut pingpong=false',
                new CAAT.Behavior.Interpolator().createBounceInInterpolator(true), 'BounceIn pingpong=true',
                new CAAT.Behavior.Interpolator().createBounceOutInterpolator(true), 'BounceOut pingpong=true',
                new CAAT.Behavior.Interpolator().createBounceInOutInterpolator(true), 'BounceInOut pingpong=true',

                new CAAT.Behavior.Interpolator().createElasticInInterpolator(1.1, 0.4, false), 'ElasticIn pingpong=false, amp=1.1, d=.4',
                new CAAT.Behavior.Interpolator().createElasticOutInterpolator(1.1, 0.4, false), 'ElasticOut pingpong=false, amp=1.1, d=.4',
                new CAAT.Behavior.Interpolator().createElasticInOutInterpolator(1.1, 0.4, false), 'ElasticInOut pingpong=false, amp=1.1, d=.4',
                new CAAT.Behavior.Interpolator().createElasticInInterpolator(1.1, 0.4, true), 'ElasticIn pingpong=true, amp=1.1, d=.4',
                new CAAT.Behavior.Interpolator().createElasticOutInterpolator(1.1, 0.4, true), 'ElasticOut pingpong=true, amp=1.1, d=.4',
                new CAAT.Behavior.Interpolator().createElasticInOutInterpolator(1.1, 0.4, true), 'ElasticInOut pingpong=true, amp=1.1, d=.4',

                new CAAT.Behavior.Interpolator().createElasticInInterpolator(1.0, 0.2, false), 'ElasticIn pingpong=false, amp=1.0, d=.2',
                new CAAT.Behavior.Interpolator().createElasticOutInterpolator(1.0, 0.2, false), 'ElasticOut pingpong=false, amp=1.0, d=.2',
                new CAAT.Behavior.Interpolator().createElasticInOutInterpolator(1.0, 0.2, false), 'ElasticInOut pingpong=false, amp=1.0, d=.2',
                new CAAT.Behavior.Interpolator().createElasticInInterpolator(1.0, 0.2, true), 'ElasticIn pingpong=true, amp=1.0, d=.2',
                new CAAT.Behavior.Interpolator().createElasticOutInterpolator(1.0, 0.2, true), 'ElasticOut pingpong=true, amp=1.0, d=.2',
                new CAAT.Behavior.Interpolator().createElasticInOutInterpolator(1.0, 0.2, true), 'ElasticInOut pingpong=true, amp=1.0, d=.2'
            ];
        },

        parse : function( obj ) {
            var name= "create"+obj.type+"Interpolator";
            var interpolator= new CAAT.Behavior.Interpolator();
            try {
                interpolator[name].apply( interpolator, obj.params||[] );
            } catch(e) {
                interpolator.createLinearInterpolator(false, false);
            }

            return interpolator;
        }

    },
    extendsWith:function () {

        return {

            /**
             * @lends CAAT.Behavior.Interpolator.prototype
             */

            interpolated:null, // a coordinate holder for not building a new CAAT.Point for each interpolation call.
            paintScale:90, // the size of the interpolation draw on screen in pixels.

            __init:function () {
                this.interpolated = new CAAT.Math.Point(0, 0, 0);
                return this;
            },

            /**
             * Set a linear interpolation function.
             *
             * @param bPingPong {boolean}
             * @param bInverse {boolean} will values will be from 1 to 0 instead of 0 to 1 ?.
             */
            createLinearInterpolator:function (bPingPong, bInverse) {
                /**
                 * Linear and inverse linear interpolation function.
                 * @param time {number}
                 */
                this.getPosition = function getPosition(time) {

                    var orgTime = time;

                    if (bPingPong) {
                        if (time < 0.5) {
                            time *= 2;
                        } else {
                            time = 1 - (time - 0.5) * 2;
                        }
                    }

                    if (bInverse !== null && bInverse) {
                        time = 1 - time;
                    }

                    return this.interpolated.set(orgTime, time);
                };

                return this;
            },

            createBackOutInterpolator:function (bPingPong) {
                this.getPosition = function getPosition(time) {
                    var orgTime = time;

                    if (bPingPong) {
                        if (time < 0.5) {
                            time *= 2;
                        } else {
                            time = 1 - (time - 0.5) * 2;
                        }
                    }

                    time = time - 1;
                    var overshoot = 1.70158;

                    return this.interpolated.set(
                        orgTime,
                        time * time * ((overshoot + 1) * time + overshoot) + 1);
                };

                return this;
            },
            /**
             * Set an exponential interpolator function. The function to apply will be Math.pow(time,exponent).
             * This function starts with 0 and ends in values of 1.
             *
             * @param exponent {number} exponent of the function.
             * @param bPingPong {boolean}
             */
            createExponentialInInterpolator:function (exponent, bPingPong) {
                this.getPosition = function getPosition(time) {
                    var orgTime = time;

                    if (bPingPong) {
                        if (time < 0.5) {
                            time *= 2;
                        } else {
                            time = 1 - (time - 0.5) * 2;
                        }
                    }
                    return this.interpolated.set(orgTime, Math.pow(time, exponent));
                };

                return this;
            },
            /**
             * Set an exponential interpolator function. The function to apply will be 1-Math.pow(time,exponent).
             * This function starts with 1 and ends in values of 0.
             *
             * @param exponent {number} exponent of the function.
             * @param bPingPong {boolean}
             */
            createExponentialOutInterpolator:function (exponent, bPingPong) {
                this.getPosition = function getPosition(time) {
                    var orgTime = time;

                    if (bPingPong) {
                        if (time < 0.5) {
                            time *= 2;
                        } else {
                            time = 1 - (time - 0.5) * 2;
                        }
                    }
                    return this.interpolated.set(orgTime, 1 - Math.pow(1 - time, exponent));
                };

                return this;
            },
            /**
             * Set an exponential interpolator function. Two functions will apply:
             * Math.pow(time*2,exponent)/2 for the first half of the function (t<0.5) and
             * 1-Math.abs(Math.pow(time*2-2,exponent))/2 for the second half (t>=.5)
             * This function starts with 0 and goes to values of 1 and ends with values of 0.
             *
             * @param exponent {number} exponent of the function.
             * @param bPingPong {boolean}
             */
            createExponentialInOutInterpolator:function (exponent, bPingPong) {
                this.getPosition = function getPosition(time) {
                    var orgTime = time;

                    if (bPingPong) {
                        if (time < 0.5) {
                            time *= 2;
                        } else {
                            time = 1 - (time - 0.5) * 2;
                        }
                    }
                    if (time * 2 < 1) {
                        return this.interpolated.set(orgTime, Math.pow(time * 2, exponent) / 2);
                    }

                    return this.interpolated.set(orgTime, 1 - Math.abs(Math.pow(time * 2 - 2, exponent)) / 2);
                };

                return this;
            },
            /**
             * Creates a Quadric bezier curbe as interpolator.
             *
             * @param p0 {CAAT.Math.Point}
             * @param p1 {CAAT.Math.Point}
             * @param p2 {CAAT.Math.Point}
             * @param bPingPong {boolean} a boolean indicating if the interpolator must ping-pong.
             */
            createQuadricBezierInterpolator:function (p0, p1, p2, bPingPong) {
                this.getPosition = function getPosition(time) {
                    var orgTime = time;

                    if (bPingPong) {
                        if (time < 0.5) {
                            time *= 2;
                        } else {
                            time = 1 - (time - 0.5) * 2;
                        }
                    }

                    time = (1 - time) * (1 - time) * p0.y + 2 * (1 - time) * time * p1.y + time * time * p2.y;

                    return this.interpolated.set(orgTime, time);
                };

                return this;
            },
            /**
             * Creates a Cubic bezier curbe as interpolator.
             *
             * @param p0 {CAAT.Math.Point}
             * @param p1 {CAAT.Math.Point}
             * @param p2 {CAAT.Math.Point}
             * @param p3 {CAAT.Math.Point}
             * @param bPingPong {boolean} a boolean indicating if the interpolator must ping-pong.
             */
            createCubicBezierInterpolator:function (p0, p1, p2, p3, bPingPong) {
                this.getPosition = function getPosition(time) {
                    var orgTime = time;

                    if (bPingPong) {
                        if (time < 0.5) {
                            time *= 2;
                        } else {
                            time = 1 - (time - 0.5) * 2;
                        }
                    }

                    var t2 = time * time;
                    var t3 = time * t2;

                    time = (p0.y + time * (-p0.y * 3 + time * (3 * p0.y -
                        p0.y * time))) + time * (3 * p1.y + time * (-6 * p1.y +
                        p1.y * 3 * time)) + t2 * (p2.y * 3 - p2.y * 3 * time) +
                        p3.y * t3;

                    return this.interpolated.set(orgTime, time);
                };

                return this;
            },
            createElasticOutInterpolator:function (amplitude, p, bPingPong) {
                this.getPosition = function getPosition(time) {

                    if (bPingPong) {
                        if (time < 0.5) {
                            time *= 2;
                        } else {
                            time = 1 - (time - 0.5) * 2;
                        }
                    }

                    if (time === 0) {
                        return {x:0, y:0};
                    }
                    if (time === 1) {
                        return {x:1, y:1};
                    }

                    var s = p / (2 * Math.PI) * Math.asin(1 / amplitude);
                    return this.interpolated.set(
                        time,
                        (amplitude * Math.pow(2, -10 * time) * Math.sin((time - s) * (2 * Math.PI) / p) + 1 ));
                };
                return this;
            },
            createElasticInInterpolator:function (amplitude, p, bPingPong) {
                this.getPosition = function getPosition(time) {

                    if (bPingPong) {
                        if (time < 0.5) {
                            time *= 2;
                        } else {
                            time = 1 - (time - 0.5) * 2;
                        }
                    }

                    if (time === 0) {
                        return {x:0, y:0};
                    }
                    if (time === 1) {
                        return {x:1, y:1};
                    }

                    var s = p / (2 * Math.PI) * Math.asin(1 / amplitude);
                    return this.interpolated.set(
                        time,
                        -(amplitude * Math.pow(2, 10 * (time -= 1)) * Math.sin((time - s) * (2 * Math.PI) / p) ));
                };

                return this;
            },
            createElasticInOutInterpolator:function (amplitude, p, bPingPong) {
                this.getPosition = function getPosition(time) {

                    if (bPingPong) {
                        if (time < 0.5) {
                            time *= 2;
                        } else {
                            time = 1 - (time - 0.5) * 2;
                        }
                    }

                    var s = p / (2 * Math.PI) * Math.asin(1 / amplitude);
                    time *= 2;
                    if (time <= 1) {
                        return this.interpolated.set(
                            time,
                            -0.5 * (amplitude * Math.pow(2, 10 * (time -= 1)) * Math.sin((time - s) * (2 * Math.PI) / p)));
                    }

                    return this.interpolated.set(
                        time,
                        1 + 0.5 * (amplitude * Math.pow(2, -10 * (time -= 1)) * Math.sin((time - s) * (2 * Math.PI) / p)));
                };

                return this;
            },
            /**
             * @param time {number}
             * @private
             */
            bounce:function (time) {
                if ((time /= 1) < (1 / 2.75)) {
                    return {x:time, y:7.5625 * time * time};
                } else if (time < (2 / 2.75)) {
                    return {x:time, y:7.5625 * (time -= (1.5 / 2.75)) * time + 0.75};
                } else if (time < (2.5 / 2.75)) {
                    return {x:time, y:7.5625 * (time -= (2.25 / 2.75)) * time + 0.9375};
                } else {
                    return {x:time, y:7.5625 * (time -= (2.625 / 2.75)) * time + 0.984375};
                }
            },
            createBounceOutInterpolator:function (bPingPong) {
                this.getPosition = function getPosition(time) {
                    if (bPingPong) {
                        if (time < 0.5) {
                            time *= 2;
                        } else {
                            time = 1 - (time - 0.5) * 2;
                        }
                    }
                    return this.bounce(time);
                };

                return this;
            },
            createBounceInInterpolator:function (bPingPong) {

                this.getPosition = function getPosition(time) {
                    if (bPingPong) {
                        if (time < 0.5) {
                            time *= 2;
                        } else {
                            time = 1 - (time - 0.5) * 2;
                        }
                    }
                    var r = this.bounce(1 - time);
                    r.y = 1 - r.y;
                    return r;
                };

                return this;
            },
            createBounceInOutInterpolator:function (bPingPong) {

                this.getPosition = function getPosition(time) {
                    if (bPingPong) {
                        if (time < 0.5) {
                            time *= 2;
                        } else {
                            time = 1 - (time - 0.5) * 2;
                        }
                    }

                    var r;
                    if (time < 0.5) {
                        r = this.bounce(1 - time * 2);
                        r.y = (1 - r.y) * 0.5;
                        return r;
                    }
                    r = this.bounce(time * 2 - 1, bPingPong);
                    r.y = r.y * 0.5 + 0.5;
                    return r;
                };

                return this;
            },

            /**
             * Paints an interpolator on screen.
             * @param ctx {CanvasRenderingContext}
             */
            paint:function (ctx) {

                ctx.save();
                ctx.beginPath();

                ctx.moveTo(0, this.getPosition(0).y * this.paintScale);

                for (var i = 0; i <= this.paintScale; i++) {
                    ctx.lineTo(i, this.getPosition(i / this.paintScale).y * this.paintScale);
                }

                ctx.strokeStyle = 'black';
                ctx.stroke();
                ctx.restore();
            },

            /**
             * Gets an array of coordinates which define the polyline of the intepolator's curve contour.
             * Values for both coordinates range from 0 to 1.
             * @param iSize {number} an integer indicating the number of contour segments.
             * @return Array.<CAAT.Math.Point> of object of the form {x:float, y:float}.
             */
            getContour:function (iSize) {
                var contour = [];
                for (var i = 0; i <= iSize; i++) {
                    contour.push({x:i / iSize, y:this.getPosition(i / iSize).y});
                }

                return contour;
            }
        }
    }
});
/**
 * See LICENSE file.
 *
 * Behaviors are keyframing elements.
 * By using a BehaviorContainer, you can specify different actions on any animation Actor.
 * An undefined number of Behaviors can be defined for each Actor.
 *
 * There're the following Behaviors:
 *  + AlphaBehavior:   controls container/actor global alpha.
 *  + RotateBehavior:  takes control of rotation affine transform.
 *  + ScaleBehavior:   takes control of scaling on x and y axis affine transform.
 *  + Scale1Behavior:  takes control of scaling on x or y axis affine transform.
 *  + PathBehavior:    takes control of translating an Actor/ActorContainer across a path [ie. pathSegment collection].
 *  + GenericBehavior: applies a behavior to any given target object's property, or notifies a callback.
 *
 *
 **/

CAAT.Module({

    /**
     *
     * Namespace for all behavior-based actor properties instrumenter objects.
     *
     * @name Behavior
     * @memberOf CAAT
     * @namespace
     */

    /**
     *
     * The BaseBehavior is the base class of all Behavior modifiers:
     *
     * <li>AlphaBehabior
     * <li>RotateBehavior
     * <li>ScaleBehavior
     * <li>Scale1Behavior
     * <li>PathBehavior
     * <li>GenericBehavior
     * <li>ContainerBehavior
     *
     * Behavior base class.
     *
     * <p>
     * A behavior is defined by a frame time (behavior duration) and a behavior application function called interpolator.
     * In its default form, a behaviour is applied linearly, that is, the same amount of behavior is applied every same
     * time interval.
     * <p>
     * A concrete Behavior, a rotateBehavior in example, will change a concrete Actor's rotationAngle during the specified
     * period.
     * <p>
     * A behavior is guaranteed to notify (if any observer is registered) on behavior expiration.
     * <p>
     * A behavior can keep an unlimited observers. Observers are objects of the form:
     * <p>
     * <code>
     * {
     *      behaviorExpired : function( behavior, time, actor);
     *      behaviorApplied : function( behavior, time, normalizedTime, actor, value);
     * }
     * </code>
     * <p>
     * <strong>behaviorExpired</strong>: function( behavior, time, actor). This method will be called for any registered observer when
     * the scene time is greater than behavior's startTime+duration. This method will be called regardless of the time
     * granurality.
     * <p>
     * <strong>behaviorApplied</strong> : function( behavior, time, normalizedTime, actor, value). This method will be called once per
     * frame while the behavior is not expired and is in frame time (behavior startTime>=scene time). This method can be
     * called multiple times.
     * <p>
     * Every behavior is applied to a concrete Actor.
     * Every actor must at least define an start and end value. The behavior will set start-value at behaviorStartTime and
     * is guaranteed to apply end-value when scene time= behaviorStartTime+behaviorDuration.
     * <p>
     * You can set behaviors to apply forever that is cyclically. When a behavior is cycle=true, won't notify
     * behaviorExpired to its registered observers.
     * <p>
     * Other Behaviors simply must supply with the method <code>setForTime(time, actor)</code> overriden.
     *
     * @name BaseBehavior
     * @memberOf CAAT.Behavior
     * @constructor
     *
     */

    /**
     *
     * Internal behavior status values. Do not assign directly.
     *
     * @name Status
     * @memberOf CAAT.Behavior.BaseBehavior
     * @namespace
     * @enum {number}
     */


    defines:        "CAAT.Behavior.BaseBehavior",
    constants:      {

        Status: {
            /**
             * @lends CAAT.Behavior.BaseBehavior.Status
             */

            /** @const @type {number}*/ NOT_STARTED: 0,
            /** @const @type {number} */ STARTED:    1,
            /** @const  @type {number}*/ EXPIRED:    2
        },

        /**
         * @lends CAAT.Behavior.BaseBehavior
         * @function
         * @param obj a JSON object with a behavior definition.
         */
        parse : function( obj ) {

            function findClass( qualifiedClassName ) {
                var ns= qualifiedClassName.split(".");
                var _global= window;
                for( var i=0; i<ns.length; i++ ) {
                    if ( !_global[ns[i]] ) {
                        return null;
                    }

                    _global= _global[ns[i]];
                }

                return _global;
            }

            try {

                var type= obj.type.toLowerCase();
                type= "CAAT.Behavior."+type.substr(0,1).toUpperCase() + type.substr(1) + "Behavior";
                var cl= new findClass(type);

                var behavior= new cl();
                behavior.parse(obj);
                return behavior;

            } catch(e) {
                console.log("Error parsing behavior: "+e);
            }

            return null;
        }
    },
    depends:        ["CAAT.Behavior.Interpolator"],
    extendsWith:   function() {

        var DefaultInterpolator=    new CAAT.Behavior.Interpolator().createLinearInterpolator(false);
        var DefaultInterpolatorPP=  new CAAT.Behavior.Interpolator().createLinearInterpolator(true);

        /** @lends CAAT.Behavior.BaseBehavior.prototype */
        return {

            /**
             * @lends CAAT.Behavior.BaseBehavior.prototype
             */

            /**
             * Constructor delegate function.
             * @return {this}
             * @private
             */
            __init:function () {
                this.lifecycleListenerList = [];
                this.setDefaultInterpolator();
                return this;
            },

            /**
             * Behavior lifecycle observer list.
             * @private
             */
            lifecycleListenerList:null,

            /**
             * Behavior application start time related to scene time.
             * @private
             */
            behaviorStartTime:-1,

            /**
             * Behavior application duration time related to scene time.
             * @private
             */
            behaviorDuration:-1,

            /**
             * Will this behavior apply for ever in a loop ?
             * @private
             */
            cycleBehavior:false,

            /**
             * behavior status.
             * @private
             */
            status: CAAT.Behavior.BaseBehavior.Status.NOT_STARTED, // Status.NOT_STARTED

            /**
             * An interpolator object to apply behaviors using easing functions, etc.
             * Unless otherwise specified, it will be linearly applied.
             * @type {CAAT.Behavior.Interpolator}
             * @private
             */
            interpolator:null,

            /**
             * The actor this behavior will be applied to.
             * @type {CAAT.Foundation.Actor}
             * @private
             */
            actor:null, // actor the Behavior acts on.

            /**
             * An id to identify this behavior.
             */
            id:0, // an integer id suitable to identify this behavior by number.

            /**
             * Initial offset to apply this behavior the first time.
             * @type {number}
             * @private
             */
            timeOffset:0,

            /**
             * Apply the behavior, or just calculate the values ?
             * @type {boolean}
             */
            doValueApplication:true,

            /**
             * Is this behavior solved ? When called setDelayTime, this flag identifies whether the behavior
             * is in time relative to the scene.
             * @type {boolean}
             * @private
             */
            solved:true,

            /**
             * if true, this behavior will be removed from the this.actor instance when it expires.
             * @type {boolean}
             * @private
             */
            discardable:false,

            /**
             * does this behavior apply relative values ??
             */
            isRelative : false,

            /**
             * Set this behavior as relative value application to some other measures.
             * Each Behavior will define its own.
             * @param bool
             * @returns {*}
             */
            setRelative : function( bool ) {
                this.isRelative= bool;
                return this;
            },

            setRelativeValues : function() {
                this.isRelative= true;
                return this;
            },

            /**
             * Parse a behavior of this type.
             * @param obj {object} an object with a behavior definition.
             */
            parse : function( obj ) {
                if ( obj.pingpong ) {
                    this.setPingPong();
                }
                if ( obj.cycle ) {
                    this.setCycle(true);
                }
                var delay= obj.delay || 0;
                var duration= obj.duration || 1000;

                this.setDelayTime( delay, duration );

                if ( obj.interpolator ) {
                    this.setInterpolator( CAAT.Behavior.Interpolator.parse(obj.interpolator) );
                }
            },

            /**
             * Set whether this behavior will apply behavior values to a reference Actor instance.
             * @param apply {boolean}
             * @return {*}
             */
            setValueApplication:function (apply) {
                this.doValueApplication = apply;
                return this;
            },

            /**
             * Set this behavior offset time.
             * This method is intended to make a behavior start applying (the first) time from a different
             * start time.
             * @param offset {number} between 0 and 1
             * @return {*}
             */
            setTimeOffset:function (offset) {
                this.timeOffset = offset;
                return this;
            },

            /**
             * Set this behavior status
             * @param st {CAAT.Behavior.BaseBehavior.Status}
             * @return {*}
             * @private
             */
            setStatus : function(st) {
                this.status= st;
                return this;
            },

            /**
             * Sets this behavior id.
             * @param id {object}
             *
             */
            setId:function (id) {
                this.id = id;
                return this;
            },

            /**
             * Sets the default interpolator to a linear ramp, that is, behavior will be applied linearly.
             * @return this
             */
            setDefaultInterpolator:function () {
                this.interpolator = DefaultInterpolator;
                return this;
            },

            /**
             * Sets default interpolator to be linear from 0..1 and from 1..0.
             * @return this
             */
            setPingPong:function () {
                this.interpolator = DefaultInterpolatorPP;
                return this;
            },

            /**
             * Sets behavior start time and duration. Start time is set absolutely relative to scene time.
             * @param startTime {number} an integer indicating behavior start time in scene time in ms..
             * @param duration {number} an integer indicating behavior duration in ms.
             */
            setFrameTime:function (startTime, duration) {
                this.behaviorStartTime = startTime;
                this.behaviorDuration = duration;
                this.status =CAAT.Behavior.BaseBehavior.Status.NOT_STARTED;

                return this;
            },

            /**
             * Sets behavior start time and duration. Start time is relative to scene time.
             *
             * a call to
             *   setFrameTime( scene.time, duration ) is equivalent to
             *   setDelayTime( 0, duration )
             * @param delay {number}
             * @param duration {number}
             */
            setDelayTime:function (delay, duration) {
                this.behaviorStartTime = delay;
                this.behaviorDuration = duration;
                this.status =CAAT.Behavior.BaseBehavior.Status.NOT_STARTED;
                this.solved = false;
                this.expired = false;

                return this;

            },

            /**
             * Make this behavior not applicable.
             * @return {*}
             */
            setOutOfFrameTime:function () {
                this.status =CAAT.Behavior.BaseBehavior.Status.EXPIRED;
                this.behaviorStartTime = Number.MAX_VALUE;
                this.behaviorDuration = 0;
                return this;
            },

            /**
             * Changes behavior default interpolator to another instance of CAAT.Interpolator.
             * If the behavior is not defined by CAAT.Interpolator factory methods, the interpolation function must return
             * its values in the range 0..1. The behavior will only apply for such value range.
             * @param interpolator a CAAT.Interpolator instance.
             */
            setInterpolator:function (interpolator) {
                this.interpolator = interpolator;
                return this;
            },

            /**
             * This method must no be called directly.
             * The director loop will call this method in orther to apply actor behaviors.
             * @param time the scene time the behaviro is being applied at.
             * @param actor a CAAT.Actor instance the behavior is being applied to.
             */
            apply:function (time, actor) {

                if (!this.solved) {
                    this.behaviorStartTime += time;
                    this.solved = true;
                }

                time += this.timeOffset * this.behaviorDuration;

                var orgTime = time;
                if (this.isBehaviorInTime(time, actor)) {
                    time = this.normalizeTime(time);
                    this.fireBehaviorAppliedEvent(
                        actor,
                        orgTime,
                        time,
                        this.setForTime(time, actor));
                }
            },

            /**
             * Sets the behavior to cycle, ie apply forever.
             * @param bool a boolean indicating whether the behavior is cycle.
             */
            setCycle:function (bool) {
                this.cycleBehavior = bool;
                return this;
            },

            isCycle : function() {
                return this.cycleBehavior;
            },

            /**
             * Adds an observer to this behavior.
             * @param behaviorListener an observer instance.
             */
            addListener:function (behaviorListener) {
                this.lifecycleListenerList.push(behaviorListener);
                return this;
            },

            /**
             * Remove all registered listeners to the behavior.
             */
            emptyListenerList:function () {
                this.lifecycleListenerList = [];
                return this;
            },

            /**
             * @return an integer indicating the behavior start time in ms..
             */
            getStartTime:function () {
                return this.behaviorStartTime;
            },

            /**
             * @return an integer indicating the behavior duration time in ms.
             */
            getDuration:function () {
                return this.behaviorDuration;

            },

            /**
             * Chekcs whether the behaviour is in scene time.
             * In case it gets out of scene time, and has not been tagged as expired, the behavior is expired and observers
             * are notified about that fact.
             * @param time the scene time to check the behavior against.
             * @param actor the actor the behavior is being applied to.
             * @return a boolean indicating whether the behavior is in scene time.
             */
            isBehaviorInTime:function (time, actor) {

                var st= CAAT.Behavior.BaseBehavior.Status;

                if (this.status === st.EXPIRED || this.behaviorStartTime < 0) {
                    return false;
                }

                if (this.cycleBehavior) {
                    if (time >= this.behaviorStartTime) {
                        time = (time - this.behaviorStartTime) % this.behaviorDuration + this.behaviorStartTime;
                    }
                }

                if (time > this.behaviorStartTime + this.behaviorDuration) {
                    if (this.status !== st.EXPIRED) {
                        this.setExpired(actor, time);
                    }

                    return false;
                }

                if (this.status === st.NOT_STARTED) {
                    this.status = st.STARTED;
                    this.fireBehaviorStartedEvent(actor, time);
                }

                return this.behaviorStartTime <= time; // && time<this.behaviorStartTime+this.behaviorDuration;
            },

            /**
             * Notify observers the first time the behavior is applied.
             * @param actor
             * @param time
             * @private
             */
            fireBehaviorStartedEvent:function (actor, time) {
                for (var i = 0, l = this.lifecycleListenerList.length; i < l; i++) {
                    var b = this.lifecycleListenerList[i];
                    if (b.behaviorStarted) {
                        b.behaviorStarted(this, time, actor);
                    }
                }
            },

            /**
             * Notify observers about expiration event.
             * @param actor a CAAT.Actor instance
             * @param time an integer with the scene time the behavior was expired at.
             * @private
             */
            fireBehaviorExpiredEvent:function (actor, time) {
                for (var i = 0, l = this.lifecycleListenerList.length; i < l; i++) {
                    var b = this.lifecycleListenerList[i];
                    if (b.behaviorExpired) {
                        b.behaviorExpired(this, time, actor);
                    }
                }
            },

            /**
             * Notify observers about behavior being applied.
             * @param actor a CAAT.Actor instance the behavior is being applied to.
             * @param time the scene time of behavior application.
             * @param normalizedTime the normalized time (0..1) considering 0 behavior start time and 1
             * behaviorStartTime+behaviorDuration.
             * @param value the value being set for actor properties. each behavior will supply with its own value version.
             * @private
             */
            fireBehaviorAppliedEvent:function (actor, time, normalizedTime, value) {
                for (var i = 0, l = this.lifecycleListenerList.length; i < l; i++) {
                    var b = this.lifecycleListenerList[i];
                    if (b.behaviorApplied) {
                        b.behaviorApplied(this, time, normalizedTime, actor, value);
                    }
                }
            },

            /**
             * Convert scene time into something more manageable for the behavior.
             * behaviorStartTime will be 0 and behaviorStartTime+behaviorDuration will be 1.
             * the time parameter will be proportional to those values.
             * @param time the scene time to be normalized. an integer.
             * @private
             */
            normalizeTime:function (time) {
                time = time - this.behaviorStartTime;
                if (this.cycleBehavior) {
                    time %= this.behaviorDuration;
                }

                return this.interpolator.getPosition(time / this.behaviorDuration).y;
            },

            /**
             * Sets the behavior as expired.
             * This method must not be called directly. It is an auxiliary method to isBehaviorInTime method.
             * @param actor {CAAT.Actor}
             * @param time {integer} the scene time.
             * @private
             */
            setExpired:function (actor, time) {
                // set for final interpolator value.
                this.status = CAAT.Behavior.BaseBehavior.Status.EXPIRED;
                this.setForTime(this.interpolator.getPosition(1).y, actor);
                this.fireBehaviorExpiredEvent(actor, time);

                if (this.discardable) {
                    this.actor.removeBehavior(this);
                }
            },

            /**
             * This method must be overriden for every Behavior breed.
             * Must not be called directly.
             * @param actor {CAAT.Actor} a CAAT.Actor instance.
             * @param time {number} an integer with the scene time.
             * @private
             */
            setForTime:function (time, actor) {

            },

            /**
             * @param overrides
             */
            initialize:function (overrides) {
                if (overrides) {
                    for (var i in overrides) {
                        this[i] = overrides[i];
                    }
                }

                return this;
            },

            /**
             * Get this behaviors CSS property name application.
             * @return {String}
             */
            getPropertyName:function () {
                return "";
            },

            /**
             * Calculate a CSS3 @key-frame for this behavior at the given time.
             * @param time {number}
             */
            calculateKeyFrameData:function (time) {
            },

            /**
             * Calculate a CSS3 @key-frame data values instead of building a CSS3 @key-frame value.
             * @param time {number}
             */
            getKeyFrameDataValues : function(time) {
            },

            /**
             * Calculate a complete CSS3 @key-frame set for this behavior.
             * @param prefix {string} browser vendor prefix
             * @param name {string} keyframes animation name
             * @param keyframessize {number} number of keyframes to generate
             */
            calculateKeyFramesData:function (prefix, name, keyframessize) {
            }

        }
    }
});



CAAT.Module({

    /**
     * @name AlphaBehavior
     * @memberOf CAAT.Behavior
     * @extends CAAT.Behavior.BaseBehavior
     * @constructor
     */

    defines:"CAAT.Behavior.AlphaBehavior",
    aliases:["CAAT.AlphaBehavior"],
    depends:["CAAT.Behavior.BaseBehavior"],
    extendsClass:"CAAT.Behavior.BaseBehavior",
    extendsWith:function () {
        return {

            /**
             * @lends CAAT.Behavior.AlphaBehavior.prototype
             */

            /**
             * Starting alpha transparency value. Between 0 and 1.
             * @type {number}
             * @private
             */
            startAlpha:0,

            /**
             * Ending alpha transparency value. Between 0 and 1.
             * @type {number}
             * @private
             */
            endAlpha:0,

            /**
             * @inheritsDoc
             * @param obj
             */
            parse : function( obj ) {
                CAAT.Behavior.AlphaBehavior.superclass.parse.call(this,obj);
                this.startAlpha= obj.start || 0;
                this.endAlpha= obj.end || 0;
            },

            /**
             * @inheritDoc
             */
            getPropertyName:function () {
                return "opacity";
            },

            /**
             * Applies corresponding alpha transparency value for a given time.
             *
             * @param time the time to apply the scale for.
             * @param actor the target actor to set transparency for.
             * @return {number} the alpha value set. Normalized from 0 (total transparency) to 1 (total opacity)
             */
            setForTime:function (time, actor) {

                CAAT.Behavior.AlphaBehavior.superclass.setForTime.call(this, time, actor);

                var alpha = (this.startAlpha + time * (this.endAlpha - this.startAlpha));
                if (this.doValueApplication) {
                    actor.setAlpha(alpha);
                }
                return alpha;
            },

            /**
             * Set alpha transparency minimum and maximum value.
             * This value can be coerced by Actor's property isGloblAlpha.
             *
             * @param start {number} a float indicating the starting alpha value.
             * @param end {number} a float indicating the ending alpha value.
             */
            setValues:function (start, end) {
                this.startAlpha = start;
                this.endAlpha = end;
                return this;
            },

            /**
             * @inheritDoc
             */
            calculateKeyFrameData:function (time) {
                time = this.interpolator.getPosition(time).y;
                return  (this.startAlpha + time * (this.endAlpha - this.startAlpha));
            },

            /**
             * @inheritDoc
             */
            getKeyFrameDataValues : function(time) {
                time = this.interpolator.getPosition(time).y;
                return {
                    alpha : this.startAlpha + time * (this.endAlpha - this.startAlpha)
                };
            },

            /**
             * @inheritDoc
             * @override
             */
            calculateKeyFramesData:function (prefix, name, keyframessize) {

                if (typeof keyframessize === 'undefined') {
                    keyframessize = 100;
                }
                keyframessize >>= 0;

                var i;
                var kfr;
                var kfd = "@-" + prefix + "-keyframes " + name + " {";

                for (i = 0; i <= keyframessize; i++) {
                    kfr = "" +
                        (i / keyframessize * 100) + "%" + // percentage
                        "{" +
                        "opacity: " + this.calculateKeyFrameData(i / keyframessize) +
                        "}";

                    kfd += kfr;
                }

                kfd += "}";

                return kfd;
            }
        }
    }
});
CAAT.Module({

    /**
     * @name ContainerBehavior
     * @memberOf CAAT.Behavior
     * @extends CAAT.Behavior.BaseBehavior
     * @constructor
     */

    defines:"CAAT.Behavior.ContainerBehavior",
    depends:["CAAT.Behavior.BaseBehavior", "CAAT.Behavior.GenericBehavior"],
    aliases: ["CAAT.ContainerBehavior"],
    extendsClass : "CAAT.Behavior.BaseBehavior",
    extendsWith:function () {

        return {

            /**
             * @lends CAAT.Behavior.ContainerBehavior.prototype
             */

            /**
             * @inheritDoc
             */
            parse : function( obj ) {
                if ( obj.behaviors && obj.behaviors.length ) {
                    for( var i=0; i<obj.behaviors.length; i+=1 ) {
                        this.addBehavior( CAAT.Behavior.BaseBehavior.parse( obj.behaviors[i] ) );
                    }
                }
                CAAT.Behavior.ContainerBehavior.superclass.parse.call(this,obj);
            },

            /**
             * A collection of behaviors.
             * @type {Array.<CAAT.Behavior.BaseBehavior>}
             */
            behaviors:null, // contained behaviors array
            recursiveCycleBehavior : false,
            conforming : false,

            /**
             * @param conforming {bool=} conform this behavior duration to that of its children.
             * @inheritDoc
             * @private
             */
            __init:function ( conforming ) {
                this.__super();
                this.behaviors = [];
                if ( conforming ) {
                    this.conforming= true;
                }
                return this;
            },

            /**
             * Proportionally change this container duration to its children.
             * @param duration {number} new duration in ms.
             * @return this;
             */
            conformToDuration:function (duration) {
                this.duration = duration;

                var f = duration / this.duration;
                var bh;
                for (var i = 0; i < this.behaviors.length; i++) {
                    bh = this.behaviors[i];
                    bh.setFrameTime(bh.getStartTime() * f, bh.getDuration() * f);
                }

                return this;
            },

            /**
             * Get a behavior by mathing its id.
             * @param id {object}
             */
            getBehaviorById : function(id) {
                for( var i=0; i<this.behaviors.length; i++ ) {
                    if ( this.behaviors[i].id===id ) {
                        return this.behaviors[i];
                    }
                }

                return null;
            },

            setCycle : function( cycle, recurse ) {
                CAAT.Behavior.ContainerBehavior.superclass.setCycle.call(this,cycle);

                if ( recurse ) {
                    for( var i=0; i<this.behaviors.length; i++ ) {
                        this.behaviors[i].setCycle(cycle);
                    }
                }

                this.recursiveCycleBehavior= recurse;

                return this;
            },

            /**
             * Add a new behavior to the container.
             * @param behavior {CAAT.Behavior.BaseBehavior}
             */
            addBehavior:function (behavior) {
                this.behaviors.push(behavior);
                behavior.addListener(this);

                if ( this.conforming ) {
                    var len= behavior.behaviorDuration + behavior.behaviorStartTime;
                    if ( this.behaviorDuration < len ) {
                        this.behaviorDuration= len;
                        this.behaviorStartTime= 0;
                    }
                }

                if ( this.recursiveCycleBehavior ) {
                    behavior.setCycle( this.isCycle() );
                }

                return this;
            },

            /**
             * Applies every contained Behaviors.
             * The application time the contained behaviors will receive will be ContainerBehavior related and not the
             * received time.
             * @param time an integer indicating the time to apply the contained behaviors at.
             * @param actor a CAAT.Foundation.Actor instance indicating the actor to apply the behaviors for.
             */
            apply:function (time, actor) {

                if (!this.solved) {
                    this.behaviorStartTime += time;
                    this.solved = true;
                }

                time += this.timeOffset * this.behaviorDuration;

                if (this.isBehaviorInTime(time, actor)) {
                    time -= this.behaviorStartTime;
                    if (this.cycleBehavior) {
                        time %= this.behaviorDuration;
                    }

                    var bh = this.behaviors;
                    for (var i = 0; i < bh.length; i++) {
                        bh[i].apply(time, actor);
                    }
                }
            },

            /**
             * This method is the observer implementation for every contained behavior.
             * If a container is Cycle=true, won't allow its contained behaviors to be expired.
             * @param behavior a CAAT.Behavior.BaseBehavior instance which has been expired.
             * @param time an integer indicating the time at which has become expired.
             * @param actor a CAAT.Foundation.Actor the expired behavior is being applied to.
             */
            behaviorExpired:function (behavior, time, actor) {
                if (this.cycleBehavior) {
                    behavior.setStatus(CAAT.Behavior.BaseBehavior.Status.STARTED);
                }
            },

            behaviorApplied : function(behavior, scenetime, time, actor, value ) {
                this.fireBehaviorAppliedEvent(actor, scenetime, time, value);
            },

            /**
             * Implementation method of the behavior.
             * Just call implementation method for its contained behaviors.
             * @param time{number} an integer indicating the time the behavior is being applied at.
             * @param actor{CAAT.Foundation.Actor} an actor the behavior is being applied to.
             */
            setForTime:function (time, actor) {
                var retValue= null;
                var bh = this.behaviors;
                for (var i = 0; i < bh.length; i++) {
                    retValue= bh[i].setForTime(time, actor);
                }

                return retValue;
            },

            /**
             * Expire this behavior and the children applied at the parameter time.
             * @param actor {CAAT.Foundation.Actor}
             * @param time {number}
             * @return {*}
             */
            setExpired:function (actor, time) {

                var bh = this.behaviors;
                // set for final interpolator value.
                for (var i = 0; i < bh.length; i++) {
                    var bb = bh[i];
                    if ( bb.status !== CAAT.Behavior.BaseBehavior.Status.EXPIRED) {
                        bb.setExpired(actor, time - this.behaviorStartTime);
                    }
                }

                /**
                 * moved here from the beggining of the method.
                 * allow for expiration observers to reset container behavior and its sub-behaviors
                 * to redeem.
                 */
                CAAT.Behavior.ContainerBehavior.superclass.setExpired.call(this, actor, time);

                return this;
            },

            /**
             * @inheritDoc
             */
            setFrameTime:function (start, duration) {
                CAAT.Behavior.ContainerBehavior.superclass.setFrameTime.call(this, start, duration);

                var bh = this.behaviors;
                for (var i = 0; i < bh.length; i++) {
                    bh[i].setStatus(CAAT.Behavior.BaseBehavior.Status.NOT_STARTED);
                }
                return this;
            },

            /**
             * @inheritDoc
             */
            setDelayTime:function (start, duration) {
                CAAT.Behavior.ContainerBehavior.superclass.setDelayTime.call(this, start, duration);

                var bh = this.behaviors;
                for (var i = 0; i < bh.length; i++) {
                    bh[i].setStatus(CAAT.Behavior.BaseBehavior.Status.NOT_STARTED);
                }
                return this;
            },

            /**
             * @inheritDoc
             */
            getKeyFrameDataValues : function(referenceTime) {

                var i, bh, time;
                var keyFrameData= {
                    angle : 0,
                    scaleX : 1,
                    scaleY : 1,
                    x : 0,
                    y : 0
                };

                for (i = 0; i < this.behaviors.length; i++) {
                    bh = this.behaviors[i];
                    if (bh.status !== CAAT.Behavior.BaseBehavior.Status.EXPIRED && !(bh instanceof CAAT.Behavior.GenericBehavior)) {

                        // ajustar tiempos:
                        //  time es tiempo normalizado a duracion de comportamiento contenedor.
                        //      1.- desnormalizar
                        time = referenceTime * this.behaviorDuration;

                        //      2.- calcular tiempo relativo de comportamiento respecto a contenedor
                        if (bh.behaviorStartTime <= time && bh.behaviorStartTime + bh.behaviorDuration >= time) {
                            //      3.- renormalizar tiempo reltivo a comportamiento.
                            time = (time - bh.behaviorStartTime) / bh.behaviorDuration;

                            //      4.- obtener valor de comportamiento para tiempo normalizado relativo a contenedor
                            var obj= bh.getKeyFrameDataValues(time);
                            for( var pr in obj ) {
                                keyFrameData[pr]= obj[pr];
                            }
                        }
                    }
                }

                return keyFrameData;
            },

            /**
             * @inheritDoc
             */
            calculateKeyFrameData:function (referenceTime, prefix) {

                var i;
                var bh;

                var retValue = {};
                var time;
                var cssRuleValue;
                var cssProperty;
                var property;

                for (i = 0; i < this.behaviors.length; i++) {
                    bh = this.behaviors[i];
                    if (bh.status !== CAAT.Behavior.BaseBehavior.Status.EXPIRED && !(bh instanceof CAAT.Behavior.GenericBehavior)) {

                        // ajustar tiempos:
                        //  time es tiempo normalizado a duracion de comportamiento contenedor.
                        //      1.- desnormalizar
                        time = referenceTime * this.behaviorDuration;

                        //      2.- calcular tiempo relativo de comportamiento respecto a contenedor
                        if (bh.behaviorStartTime <= time && bh.behaviorStartTime + bh.behaviorDuration >= time) {
                            //      3.- renormalizar tiempo reltivo a comportamiento.
                            time = (time - bh.behaviorStartTime) / bh.behaviorDuration;

                            //      4.- obtener valor de comportamiento para tiempo normalizado relativo a contenedor
                            cssRuleValue = bh.calculateKeyFrameData(time);
                            cssProperty = bh.getPropertyName(prefix);

                            if (typeof retValue[cssProperty] === 'undefined') {
                                retValue[cssProperty] = "";
                            }

                            //      5.- asignar a objeto, par de propiedad/valor css
                            retValue[cssProperty] += cssRuleValue + " ";
                        }

                    }
                }


                var tr = "";
                var pv;

                function xx(pr) {
                    if (retValue[pr]) {
                        tr += retValue[pr];
                    } else {
                        if (prevValues) {
                            pv = prevValues[pr];
                            if (pv) {
                                tr += pv;
                                retValue[pr] = pv;
                            }
                        }
                    }
                }

                xx('translate');
                xx('rotate');
                xx('scale');

                var keyFrameRule = "";

                if (tr) {
                    keyFrameRule = '-' + prefix + '-transform: ' + tr + ';';
                }

                tr = "";
                xx('opacity');
                if (tr) {
                    keyFrameRule += ' opacity: ' + tr + ';';
                }

                keyFrameRule+=" -webkit-transform-origin: 0% 0%";

                return {
                    rules:keyFrameRule,
                    ret:retValue
                };

            },

            /**
             * @inheritDoc
             */
            calculateKeyFramesData:function (prefix, name, keyframessize, anchorX, anchorY) {

                function toKeyFrame(obj, prevKF) {

                    for( var i in prevKF ) {
                        if ( !obj[i] ) {
                            obj[i]= prevKF[i];
                        }
                    }

                    var ret= "-" + prefix + "-transform:";

                    if ( obj.x || obj.y ) {
                        var x= obj.x || 0;
                        var y= obj.y || 0;
                        ret+= "translate("+x+"px,"+y+"px)";
                    }

                    if ( obj.angle ) {
                        ret+= " rotate("+obj.angle+"rad)";
                    }

                    if ( obj.scaleX!==1 || obj.scaleY!==1 ) {
                        ret+= " scale("+(obj.scaleX)+","+(obj.scaleY)+")";
                    }

                    ret+=";";

                    if ( obj.alpha ) {
                        ret+= " opacity: "+obj.alpha+";";
                    }

                    if ( anchorX!==.5 || anchorY!==.5) {
                        ret+= " -" + prefix + "-transform-origin:"+ (anchorX*100) + "% " + (anchorY*100) + "%;";
                    }

                    return ret;
                }

                if (this.duration === Number.MAX_VALUE) {
                    return "";
                }

                if (typeof anchorX==="undefined") {
                    anchorX= .5;
                }

                if (typeof anchorY==="undefined") {
                    anchorY= .5;
                }

                if (typeof keyframessize === 'undefined') {
                    keyframessize = 100;
                }

                var i;
                var kfd = "@-" + prefix + "-keyframes " + name + " {";
                var time;
                var prevKF= {};

                for (i = 0; i <= keyframessize; i++) {
                    time = this.interpolator.getPosition(i / keyframessize).y;

                    var obj = this.getKeyFrameDataValues(time);

                    kfd += "" +
                        (i / keyframessize * 100) + "%" + // percentage
                        "{" + toKeyFrame(obj, prevKF) + "}\n";

                    prevKF= obj;

                }

                kfd += "}\n";

                return kfd;
            }
        }
    }
});
CAAT.Module({
    /**
     * @name GenericBehavior
     * @memberOf CAAT.Behavior
     * @extends CAAT.Behavior.BaseBehavior
     * @constructor
     */
    defines:"CAAT.Behavior.GenericBehavior",
    depends:["CAAT.Behavior.BaseBehavior"],
    aliases:["CAAT.GenericBehavior"],
    extendsClass:"CAAT.Behavior.BaseBehavior",
    extendsWith:function () {

        return {

            /**
             *  @lends CAAT.Behavior.GenericBehavior.prototype
             */


            /**
             * starting value.
             */
            start:0,

            /**
             * ending value.
             */
            end:0,

            /**
             * target to apply this generic behvior.
             */
            target:null,

            /**
             * property to apply values to.
             */
            property:null,

            /**
             * this callback will be invoked for every behavior application.
             */
            callback:null,

            /**
             * @inheritDoc
             */
            setForTime:function (time, actor) {
                var value = this.start + time * (this.end - this.start);
                if (this.callback) {
                    this.callback(value, this.target, actor);
                }

                if (this.property) {
                    this.target[this.property] = value;
                }
            },

            /**
             * Defines the values to apply this behavior.
             *
             * @param start {number} initial behavior value.
             * @param end {number} final behavior value.
             * @param target {object} an object. Usually a CAAT.Actor.
             * @param property {string} target object's property to set value to.
             * @param callback {function} a function of the form <code>function( target, value )</code>.
             */
            setValues:function (start, end, target, property, callback) {
                this.start = start;
                this.end = end;
                this.target = target;
                this.property = property;
                this.callback = callback;
                return this;
            }
        };
    }
});
CAAT.Module({

    /**
     * @name PathBehavior
     * @memberOf CAAT.Behavior
     * @extends CAAT.Behavior.BaseBehavior
     * @constructor
     */

    /**
     *
     * Internal PathBehavior rotation constants.
     *
     * @name AUTOROTATE
     * @memberOf CAAT.Behavior.PathBehavior
     * @namespace
     * @enum {number}
     */

    /**
     *
     * Internal PathBehavior rotation constants.
     *
     * @name autorotate
     * @memberOf CAAT.Behavior.PathBehavior
     * @namespace
     * @enum {number}
     * @deprecated
     */

    defines:"CAAT.Behavior.PathBehavior",
    aliases: ["CAAT.PathBehavior"],
    depends:[
        "CAAT.Behavior.BaseBehavior",
        "CAAT.Foundation.SpriteImage"
    ],
    constants : {

        AUTOROTATE : {

            /**
             * @lends CAAT.Behavior.PathBehavior.AUTOROTATE
             */

            /** @const */ LEFT_TO_RIGHT:  0,
            /** @const */ RIGHT_TO_LEFT:  1,
            /** @const */ FREE:           2
        },

        autorotate: {
            /**
             * @lends CAAT.Behavior.PathBehavior.autorotate
             */

            /** @const */ LEFT_TO_RIGHT:  0,
            /** @const */ RIGHT_TO_LEFT:  1,
            /** @const */ FREE:           2
        }
    },
    extendsClass : "CAAT.Behavior.BaseBehavior",
    extendsWith:function () {

        return {

            /**
             * @lends CAAT.Behavior.PathBehavior.prototype
             * @param obj
             */

            /**
             * @inheritDoc
             */
            parse : function( obj ) {
                CAAT.Behavior.PathBehavior.superclass.parse.call(this,obj);

                if ( obj.SVG ) {
                    var parser= new CAAT.PathUtil.SVGPath();
                    var path=parser.parsePath( obj.SVG );
                    this.setValues(path);
                }

                if ( obj.autoRotate ) {
                    this.autoRotate= obj.autoRotate;
                }
            },

            /**
             * A path to traverse.
             * @type {CAAT.PathUtil.Path}
             * @private
             */
            path:null,

            /**
             * Whether to set rotation angle while traversing the path.
             * @private
             */
            autoRotate:false,

            prevX:-1, // private, do not use.
            prevY:-1, // private, do not use.

            /**
             * Autorotation hint.
             * @type {CAAT.Behavior.PathBehavior.autorotate}
             * @private
             */
            autoRotateOp: CAAT.Behavior.PathBehavior.autorotate.FREE,

            isOpenContour : false,

            relativeX : 0,
            relativeY : 0,

            setOpenContour : function(b) {
                this.isOpenContour= b;
                return this;
            },

            /**
             * @inheritDoc
             */
            getPropertyName:function () {
                return "translate";
            },

            setRelativeValues : function( x, y ) {
                this.relativeX= x;
                this.relativeY= y;
                this.isRelative= true;
                return this;
            },


            /**
             * Sets an actor rotation to be heading from past to current path's point.
             * Take into account that this will be incompatible with rotation Behaviors
             * since they will set their own rotation configuration.
             * @param autorotate {boolean}
             * @param autorotateOp {CAAT.PathBehavior.autorotate} whether the sprite is drawn heading to the right.
             * @return this.
             */
            setAutoRotate:function (autorotate, autorotateOp) {
                this.autoRotate = autorotate;
                if (autorotateOp !== undefined) {
                    this.autoRotateOp = autorotateOp;
                }
                return this;
            },

            /**
             * Set the behavior path.
             * The path can be any length, and will take behaviorDuration time to be traversed.
             * @param {CAAT.Path}
                *
             * @deprecated
             */
            setPath:function (path) {
                this.path = path;
                return this;
            },

            /**
             * Set the behavior path.
             * The path can be any length, and will take behaviorDuration time to be traversed.
             * @param {CAAT.Path}
                * @return this
             */
            setValues:function (path) {
                return this.setPath(path);
            },

            /**
             * @see Actor.setPositionAnchor
             * @deprecated
             * @param tx a float with xoffset.
             * @param ty a float with yoffset.
             */
            setTranslation:function (tx, ty) {
                return this;
            },

            /**
             * @inheritDoc
             */
            calculateKeyFrameData:function (time) {
                time = this.interpolator.getPosition(time).y;
                var point = this.path.getPosition(time);
                return "translateX(" + point.x + "px) translateY(" + point.y + "px)";
            },

            /**
             * @inheritDoc
             */
            getKeyFrameDataValues : function(time) {
                time = this.interpolator.getPosition(time).y;
                var point = this.path.getPosition(time);
                var obj= {
                    x : point.x,
                    y : point.y
                };

                if ( this.autoRotate ) {

                    var point2= time===0 ? point : this.path.getPosition(time -.001);
                    var ax = point.x - point2.x;
                    var ay = point.y - point2.y;
                    var angle = Math.atan2(ay, ax);

                    obj.angle= angle;
                }

                return obj;
            },

            /**
             * @inheritDoc
             */
            calculateKeyFramesData:function (prefix, name, keyframessize) {

                if (typeof keyframessize === 'undefined') {
                    keyframessize = 100;
                }
                keyframessize >>= 0;

                var i;
                var kfr;
                var time;
                var kfd = "@-" + prefix + "-keyframes " + name + " {";

                for (i = 0; i <= keyframessize; i++) {
                    kfr = "" +
                        (i / keyframessize * 100) + "%" + // percentage
                        "{" +
                        "-" + prefix + "-transform:" + this.calculateKeyFrameData(i / keyframessize) +
                        "}";

                    kfd += kfr;
                }

                kfd += "}";

                return kfd;
            },

            /**
             * @inheritDoc
             */
            setForTime:function (time, actor) {

                if (!this.path) {
                    return {
                        x:actor.x,
                        y:actor.y
                    };
                }

                var point = this.path.getPosition(time, this.isOpenContour,.001);
                if (this.isRelative ) {
                    point.x+= this.relativeX;
                    point.y+= this.relativeY;
                }

                if (this.autoRotate) {

                    if (-1 === this.prevX && -1 === this.prevY) {
                        this.prevX = point.x;
                        this.prevY = point.y;
                    }

                    var ax = point.x - this.prevX;
                    var ay = point.y - this.prevY;

                    if (ax === 0 && ay === 0) {
                        actor.setLocation(point.x, point.y);
                        return { x:actor.x, y:actor.y };
                    }

                    var angle = Math.atan2(ay, ax);
                    var si = CAAT.Foundation.SpriteImage;
                    var pba = CAAT.Behavior.PathBehavior.AUTOROTATE;

                    // actor is heading left to right
                    if (this.autoRotateOp === pba.LEFT_TO_RIGHT) {
                        if (this.prevX <= point.x) {
                            actor.setImageTransformation(si.TR_NONE);
                        }
                        else {
                            actor.setImageTransformation(si.TR_FLIP_HORIZONTAL);
                            angle += Math.PI;
                        }
                    } else if (this.autoRotateOp === pba.RIGHT_TO_LEFT) {
                        if (this.prevX <= point.x) {
                            actor.setImageTransformation(si.TR_FLIP_HORIZONTAL);
                        }
                        else {
                            actor.setImageTransformation(si.TR_NONE);
                            angle -= Math.PI;
                        }
                    }

                    actor.setRotation(angle);

                    this.prevX = point.x;
                    this.prevY = point.y;

                    var modulo = Math.sqrt(ax * ax + ay * ay);
                    ax /= modulo;
                    ay /= modulo;
                }

                if (this.doValueApplication) {
                    actor.setLocation(point.x, point.y);
                    return { x:actor.x, y:actor.y };
                } else {
                    return {
                        x:point.x,
                        y:point.y
                    };
                }


            },

            /**
             * Get a point on the path.
             * If the time to get the point at is in behaviors frame time, a point on the path will be returned, otherwise
             * a default {x:-1, y:-1} point will be returned.
             *
             * @param time {number} the time at which the point will be taken from the path.
             * @return {object} an object of the form {x:float y:float}
             */
            positionOnTime:function (time) {
                if (this.isBehaviorInTime(time, null)) {
                    time = this.normalizeTime(time);
                    return this.path.getPosition(time);
                }

                return {x:-1, y:-1};

            }
        };
    }
});
CAAT.Module({

    /**
     * @name RotateBehavior
     * @memberOf CAAT.Behavior
     * @extends CAAT.Behavior.BaseBehavior
     * @constructor
     */

    defines:"CAAT.Behavior.RotateBehavior",
    extendsClass: "CAAT.Behavior.BaseBehavior",
    depends:[
        "CAAT.Behavior.BaseBehavior",
        "CAAT.Foundation.Actor"
    ],
    aliases: ["CAAT.RotateBehavior"],
    extendsWith:function () {

        return {

            /**
             * @lends CAAT.Behavior.RotateBehavior.prototype
             */


            __init:function () {
                this.__super();
                this.anchor = CAAT.Foundation.Actor.ANCHOR_CENTER;
                return this;
            },

            /**
             * @inheritDoc
             */
            parse : function( obj ) {
                CAAT.Behavior.RotateBehavior.superclass.parse.call(this,obj);
                this.startAngle= obj.start || 0;
                this.endAngle= obj.end || 0;
                this.anchorX= (typeof obj.anchorX!=="undefined" ? parseInt(obj.anchorX) : 0.5);
                this.anchorY= (typeof obj.anchorY!=="undefined" ? parseInt(obj.anchorY) : 0.5);
            },

            /**
             * Start rotation angle.
             * @type {number}
             * @private
             */
            startAngle:0,

            /**
             * End rotation angle.
             * @type {number}
             * @private
             */
            endAngle:0,

            /**
             * Rotation X anchor.
             * @type {number}
             * @private
             */
            anchorX:.50,

            /**
             * Rotation Y anchor.
             * @type {number}
             * @private
             */
            anchorY:.50,

            rotationRelative: 0,

            setRelativeValues : function(r) {
                this.rotationRelative= r;
                this.isRelative= true;
                return this;
            },

            /**
             * @inheritDoc
             */
            getPropertyName:function () {
                return "rotate";
            },

            /**
             * @inheritDoc
             */
            setForTime:function (time, actor) {
                var angle = this.startAngle + time * (this.endAngle - this.startAngle);

                if ( this.isRelative ) {
                    angle+= this.rotationRelative;
                    if (angle>=Math.PI) {
                        angle= (angle-2*Math.PI)
                    }
                    if ( angle<-2*Math.PI) {
                        angle= (angle+2*Math.PI);
                    }
                }

                if (this.doValueApplication) {
                    actor.setRotationAnchored(angle, this.anchorX, this.anchorY);
                }

                return angle;

            },

            /**
             * Set behavior bound values.
             * if no anchorx,anchory values are supplied, the behavior will assume
             * 50% for both values, that is, the actor's center.
             *
             * Be aware the anchor values are supplied in <b>RELATIVE PERCENT</b> to
             * actor's size.
             *
             * @param startAngle {float} indicating the starting angle.
             * @param endAngle {float} indicating the ending angle.
             * @param anchorx {float} the percent position for anchorX
             * @param anchory {float} the percent position for anchorY
             */
            setValues:function (startAngle, endAngle, anchorx, anchory) {
                this.startAngle = startAngle;
                this.endAngle = endAngle;
                if (typeof anchorx !== 'undefined' && typeof anchory !== 'undefined') {
                    this.anchorX = anchorx;
                    this.anchorY = anchory;
                }
                return this;
            },

            /**
             * @deprecated
             * Use setValues instead
             * @param start
             * @param end
             */
            setAngles:function (start, end) {
                return this.setValues(start, end);
            },

            /**
             * Set the behavior rotation anchor. Use this method when setting an exact percent
             * by calling setValues is complicated.
             * @see CAAT.Actor
             *
             * These parameters are to set a custom rotation anchor point. if <code>anchor==CAAT.Actor.ANCHOR_CUSTOM
             * </code> the custom rotation point is set.
             * @param actor
             * @param rx
             * @param ry
             *
             */
            setAnchor:function (actor, rx, ry) {
                this.anchorX = rx / actor.width;
                this.anchorY = ry / actor.height;
                return this;
            },

            /**
             * @inheritDoc
             */
            calculateKeyFrameData:function (time) {
                time = this.interpolator.getPosition(time).y;
                return "rotate(" + (this.startAngle + time * (this.endAngle - this.startAngle)) + "rad)";
            },

            /**
             * @inheritDoc
             */
            getKeyFrameDataValues : function(time) {
                time = this.interpolator.getPosition(time).y;
                return {
                    angle : this.startAngle + time * (this.endAngle - this.startAngle)
                };
            },

            /**
             * @inheritDoc
             */
            calculateKeyFramesData:function (prefix, name, keyframessize) {

                if (typeof keyframessize === 'undefined') {
                    keyframessize = 100;
                }
                keyframessize >>= 0;

                var i;
                var kfr;
                var kfd = "@-" + prefix + "-keyframes " + name + " {";

                for (i = 0; i <= keyframessize; i++) {
                    kfr = "" +
                        (i / keyframessize * 100) + "%" + // percentage
                        "{" +
                        "-" + prefix + "-transform:" + this.calculateKeyFrameData(i / keyframessize) +
                        "; -" + prefix + "-transform-origin:" + (this.anchorX*100) + "% " + (this.anchorY*100) + "% " +
                        "}\n";

                    kfd += kfr;
                }

                kfd += "}\n";

                return kfd;
            }

        };

    }
});
CAAT.Module({
    /**
     * @name Scale1Behavior
     * @memberOf CAAT.Behavior
     * @extends CAAT.Behavior.BaseBehavior
     * @constructor
     */

    /**
     * @name AXIS
     * @memberOf CAAT.Behavior.Scale1Behavior
     * @enum {number}
     * @namespace
     */

    /**
     * @name Axis
     * @memberOf CAAT.Behavior.Scale1Behavior
     * @enum {number}
     * @namespace
     * @deprecated
     */


    defines:"CAAT.Behavior.Scale1Behavior",
    depends:[
        "CAAT.Behavior.BaseBehavior",
        "CAAT.Foundation.Actor"
    ],
    aliases: ["CAAT.Scale1Behavior"],
    constants : {

        AXIS : {
            /**
             * @lends CAAT.Behavior.Scale1Behavior.AXIS
             */

            /** @const */ X:  0,
            /** @const */ Y:  1
        },

        Axis : {
            /**
             * @lends CAAT.Behavior.Scale1Behavior.Axis
             */

            /** @const */ X:  0,
            /** @const */ Y:  1
        }
    },
    extendsClass:"CAAT.Behavior.BaseBehavior",
    extendsWith:function () {

        return {

            /**
             * @lends CAAT.Behavior.Scale1Behavior.prototype
             */

            __init:function () {
                this.__super();
                this.anchor = CAAT.Foundation.Actor.ANCHOR_CENTER;
                return this;
            },

            /**
             * Start scale value.
             * @private
             */
            startScale:1,

            /**
             * End scale value.
             * @private
             */
            endScale:1,

            /**
             * Scale X anchor.
             * @private
             */
            anchorX:.50,

            /**
             * Scale Y anchor.
             * @private
             */
            anchorY:.50,

            /**
             * Apply on Axis X or Y ?
             */
            applyOnX:true,

            parse : function( obj ) {
                CAAT.Behavior.Scale1Behavior.superclass.parse.call(this,obj);
                this.startScale= obj.start || 0;
                this.endScale= obj.end || 0;
                this.anchorX= (typeof obj.anchorX!=="undefined" ? parseInt(obj.anchorX) : 0.5);
                this.anchorY= (typeof obj.anchorY!=="undefined" ? parseInt(obj.anchorY) : 0.5);
                this.applyOnX= obj.axis ? obj.axis.toLowerCase()==="x" : true;
            },

            /**
             * @param axis {CAAT.Behavior.Scale1Behavior.AXIS}
             */
            applyOnAxis:function (axis) {
                if (axis === CAAT.Behavior.Scale1Behavior.AXIS.X) {
                    this.applyOnX = false;
                } else {
                    this.applyOnX = true;
                }
            },

            /**
             * @inheritDoc
             */
            getPropertyName:function () {
                return "scale";
            },

            /**
             * @inheritDoc
             */
            setForTime:function (time, actor) {

                var scale = this.startScale + time * (this.endScale - this.startScale);

                // Firefox 3.x & 4, will crash animation if either scaleX or scaleY equals 0.
                if (0 === scale) {
                    scale = 0.01;
                }

                if (this.doValueApplication) {
                    if (this.applyOnX) {
                        actor.setScaleAnchored(scale, actor.scaleY, this.anchorX, this.anchorY);
                    } else {
                        actor.setScaleAnchored(actor.scaleX, scale, this.anchorX, this.anchorY);
                    }
                }

                return scale;
            },

            /**
             * Define this scale behaviors values.
             *
             * Be aware the anchor values are supplied in <b>RELATIVE PERCENT</b> to
             * actor's size.
             *
             * @param start {number} initial X axis scale value.
             * @param end {number} final X axis scale value.
             * @param anchorx {float} the percent position for anchorX
             * @param anchory {float} the percent position for anchorY
             *
             * @return this.
             */
            setValues:function (start, end, applyOnX, anchorx, anchory) {
                this.startScale = start;
                this.endScale = end;
                this.applyOnX = !!applyOnX;

                if (typeof anchorx !== 'undefined' && typeof anchory !== 'undefined') {
                    this.anchorX = anchorx;
                    this.anchorY = anchory;
                }

                return this;
            },

            /**
             * Set an exact position scale anchor. Use this method when it is hard to
             * set a thorough anchor position expressed in percentage.
             * @param actor
             * @param x
             * @param y
             */
            setAnchor:function (actor, x, y) {
                this.anchorX = x / actor.width;
                this.anchorY = y / actor.height;

                return this;
            },

            /**
             * @inheritDoc
             */
            calculateKeyFrameData:function (time) {
                var scale;

                time = this.interpolator.getPosition(time).y;
                scale = this.startScale + time * (this.endScale - this.startScale);

                return this.applyOnX ? "scaleX(" + scale + ")" : "scaleY(" + scale + ")";
            },

            /**
             * @inheritDoc
             */
            getKeyFrameDataValues : function(time) {
                time = this.interpolator.getPosition(time).y;
                var obj= {};
                obj[ this.applyOnX ? "scaleX" : "scaleY" ]= this.startScale + time * (this.endScale - this.startScale);

                return obj;
            },

            /**
             * @inheritDoc
             */
            calculateKeyFramesData:function (prefix, name, keyframessize) {

                if (typeof keyframessize === 'undefined') {
                    keyframessize = 100;
                }
                keyframessize >>= 0;

                var i;
                var kfr;
                var kfd = "@-" + prefix + "-keyframes " + name + " {";

                for (i = 0; i <= keyframessize; i++) {
                    kfr = "" +
                        (i / keyframessize * 100) + "%" + // percentage
                        "{" +
                        "-" + prefix + "-transform:" + this.calculateKeyFrameData(i / keyframessize) +
                        "; -" + prefix + "-transform-origin:" + (this.anchorX*100) + "% " + (this.anchorY*100) + "% " +
                        "}\n";

                    kfd += kfr;
                }

                kfd += "}\n";

                return kfd;
            }
        }

    }
});
CAAT.Module({

    /**
     * @name ScaleBehavior
     * @memberOf CAAT.Behavior
     * @extends CAAT.Behavior.BaseBehavior
     * @constructor
     */

    defines:"CAAT.Behavior.ScaleBehavior",
    depends:[
        "CAAT.Behavior.BaseBehavior",
        "CAAT.Foundation.Actor"
    ],
    extendsClass:"CAAT.Behavior.BaseBehavior",
    aliases : ["CAAT.ScaleBehavior"],
    extendsWith:function () {

        return  {

            /**
             * @lends CAAT.Behavior.ScaleBehavior
             */

            __init:function () {
                this.__super();
                this.anchor = CAAT.Foundation.Actor.ANCHOR_CENTER;
                return this;
            },

            /**
             * Start X scale value.
             * @private
             * @type {number}
             */
            startScaleX:1,

            /**
             * End X scale value.
             * @private
             * @type {number}
             */
            endScaleX:1,

            /**
             * Start Y scale value.
             * @private
             * @type {number}
             */
            startScaleY:1,

            /**
             * End Y scale value.
             * @private
             * @type {number}
             */
            endScaleY:1,

            /**
             * Scale X anchor value.
             * @private
             * @type {number}
             */
            anchorX:.50,

            /**
             * Scale Y anchor value.
             * @private
             * @type {number}
             */
            anchorY:.50,

            /**
             * @inheritDoc
             */
            parse : function( obj ) {
                CAAT.Behavior.ScaleBehavior.superclass.parse.call(this,obj);
                this.startScaleX= (obj.scaleX && obj.scaleX.start) || 0;
                this.endScaleX= (obj.scaleX && obj.scaleX.end) || 0;
                this.startScaleY= (obj.scaleY && obj.scaleY.start) || 0;
                this.endScaleY= (obj.scaleY && obj.scaleY.end) || 0;
                this.anchorX= (typeof obj.anchorX!=="undefined" ? parseInt(obj.anchorX) : 0.5);
                this.anchorY= (typeof obj.anchorY!=="undefined" ? parseInt(obj.anchorY) : 0.5);
            },

            /**
             * @inheritDoc
             */
            getPropertyName:function () {
                return "scale";
            },

            /**
             * Applies corresponding scale values for a given time.
             *
             * @param time the time to apply the scale for.
             * @param actor the target actor to Scale.
             * @return {object} an object of the form <code>{ scaleX: {float}, scaleY: {float}�}</code>
             */
            setForTime:function (time, actor) {

                var scaleX = this.startScaleX + time * (this.endScaleX - this.startScaleX);
                var scaleY = this.startScaleY + time * (this.endScaleY - this.startScaleY);

                // Firefox 3.x & 4, will crash animation if either scaleX or scaleY equals 0.
                if (0 === scaleX) {
                    scaleX = 0.01;
                }
                if (0 === scaleY) {
                    scaleY = 0.01;
                }

                if (this.doValueApplication) {
                    actor.setScaleAnchored(scaleX, scaleY, this.anchorX, this.anchorY);
                }

                return { scaleX:scaleX, scaleY:scaleY };
            },
            /**
             * Define this scale behaviors values.
             *
             * Be aware the anchor values are supplied in <b>RELATIVE PERCENT</b> to
             * actor's size.
             *
             * @param startX {number} initial X axis scale value.
             * @param endX {number} final X axis scale value.
             * @param startY {number} initial Y axis scale value.
             * @param endY {number} final Y axis scale value.
             * @param anchorx {float} the percent position for anchorX
             * @param anchory {float} the percent position for anchorY
             *
             * @return this.
             */
            setValues:function (startX, endX, startY, endY, anchorx, anchory) {
                this.startScaleX = startX;
                this.endScaleX = endX;
                this.startScaleY = startY;
                this.endScaleY = endY;

                if (typeof anchorx !== 'undefined' && typeof anchory !== 'undefined') {
                    this.anchorX = anchorx;
                    this.anchorY = anchory;
                }

                return this;
            },
            /**
             * Set an exact position scale anchor. Use this method when it is hard to
             * set a thorough anchor position expressed in percentage.
             * @param actor
             * @param x
             * @param y
             */
            setAnchor:function (actor, x, y) {
                this.anchorX = x / actor.width;
                this.anchorY = y / actor.height;

                return this;
            },

            /**
             * @inheritDoc
             */
            calculateKeyFrameData:function (time) {
                var scaleX;
                var scaleY;

                time = this.interpolator.getPosition(time).y;
                scaleX = this.startScaleX + time * (this.endScaleX - this.startScaleX);
                scaleY = this.startScaleY + time * (this.endScaleY - this.startScaleY);

                return "scale(" + scaleX +"," + scaleY + ")";
            },

            /**
             * @inheritDoc
             */
            getKeyFrameDataValues : function(time) {
                time = this.interpolator.getPosition(time).y;
                return {
                    scaleX : this.startScaleX + time * (this.endScaleX - this.startScaleX),
                    scaleY : this.startScaleY + time * (this.endScaleY - this.startScaleY)
                };
            },


            /**
             * @inheritDoc
             */
            calculateKeyFramesData:function (prefix, name, keyframessize) {

                if (typeof keyframessize === 'undefined') {
                    keyframessize = 100;
                }
                keyframessize >>= 0;

                var i;
                var kfr;
                var kfd = "@-" + prefix + "-keyframes " + name + " {";

                for (i = 0; i <= keyframessize; i++) {
                    kfr = "" +
                        (i / keyframessize * 100) + "%" + // percentage
                        "{" +
                        "-" + prefix + "-transform:" + this.calculateKeyFrameData(i / keyframessize) +
                        "; -" + prefix + "-transform-origin:" + (this.anchorX*100) + "% " + (this.anchorY*100) + "% " +
                        "}\n";

                    kfd += kfr;
                }

                kfd += "}\n";

                return kfd;
            }
        }

    }
});
/**
 *
 * taken from: http://www.quirksmode.org/js/detect.html
 *
 * 20101008 Hyperandroid. IE9 seems to identify himself as Explorer and stopped calling himself MSIE.
 *          Added Explorer description to browser list. Thanks @alteredq for this tip.
 *
 */
CAAT.Module({

    /**
     * @name Runtime
     * @memberOf CAAT.Module
     * @namespace
     */

    /**
     * @name BrowserInfo
     * @memberOf CAAT.Module.Runtime
     * @namespace
     */

    defines:"CAAT.Module.Runtime.BrowserInfo",

    constants: function() {

        /**
         * @lends CAAT.Module.Runtime.BrowserInfo
         */

        function searchString(data) {
            for (var i = 0; i < data.length; i++) {
                var dataString = data[i].string;
                var dataProp = data[i].prop;
                this.versionSearchString = data[i].versionSearch || data[i].identity;
                if (dataString) {
                    if (dataString.indexOf(data[i].subString) !== -1)
                        return data[i].identity;
                }
                else if (dataProp)
                    return data[i].identity;
            }
        }

        function searchVersion(dataString) {
            var index = dataString.indexOf(this.versionSearchString);
            if (index === -1) return;
            return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
        }

        var dataBrowser= [
            {
                string:navigator.userAgent,
                subString:"Chrome",
                identity:"Chrome"
            },
            {   string:navigator.userAgent,
                subString:"OmniWeb",
                versionSearch:"OmniWeb/",
                identity:"OmniWeb"
            },
            {
                string:navigator.vendor,
                subString:"Apple",
                identity:"Safari",
                versionSearch:"Version"
            },
            {
                prop:window.opera,
                identity:"Opera"
            },
            {
                string:navigator.vendor,
                subString:"iCab",
                identity:"iCab"
            },
            {
                string:navigator.vendor,
                subString:"KDE",
                identity:"Konqueror"
            },
            {
                string:navigator.userAgent,
                subString:"Firefox",
                identity:"Firefox"
            },
            {
                string:navigator.vendor,
                subString:"Camino",
                identity:"Camino"
            },
            {        // for newer Netscapes (6+)
                string:navigator.userAgent,
                subString:"Netscape",
                identity:"Netscape"
            },
            {
                string:navigator.userAgent,
                subString:"MSIE",
                identity:"Explorer",
                versionSearch:"MSIE"
            },
            {
                string:navigator.userAgent,
                subString:"Explorer",
                identity:"Explorer",
                versionSearch:"Explorer"
            },
            {
                string:navigator.userAgent,
                subString:"Gecko",
                identity:"Mozilla",
                versionSearch:"rv"
            },
            { // for older Netscapes (4-)
                string:navigator.userAgent,
                subString:"Mozilla",
                identity:"Netscape",
                versionSearch:"Mozilla"
            }
        ];

        var dataOS=[
            {
                string:navigator.platform,
                subString:"Win",
                identity:"Windows"
            },
            {
                string:navigator.platform,
                subString:"Mac",
                identity:"Mac"
            },
            {
                string:navigator.userAgent,
                subString:"iPhone",
                identity:"iPhone/iPod"
            },
            {
                string:navigator.platform,
                subString:"Linux",
                identity:"Linux"
            }
        ];

        var browser = searchString(dataBrowser) || "An unknown browser";
        var version = searchVersion(navigator.userAgent) ||
                      searchVersion(navigator.appVersion) ||
                      "an unknown version";
        var OS = searchString(dataOS) || "an unknown OS";

        var DevicePixelRatio = window.devicePixelRatio || 1;

        return {
            browser: browser,
            version: version,
            OS: OS,
            DevicePixelRatio : DevicePixelRatio
        }

    }
});
/**
 * See LICENSE file.
 *
 * Sound implementation.
 */

CAAT.Module({

    /**
     * @name Module
     * @memberOf CAAT
     * @namespace
     */

    /**
     * @name Audio
     * @memberOf CAAT.Module
     * @namespace
     */

    /**
     * @name AudioManager
     * @memberOf CAAT.Module.Audio
     * @constructor
     */

    defines:"CAAT.Module.Audio.AudioManager",
    extendsWith:function () {
        return {

            /**
             * @lends CAAT.Module.Audio.AudioManager.prototype
             */

            __init:function () {
                this.isFirefox= navigator.userAgent.match(/Firefox/g)!==null;
                return this;
            },

            isFirefox : false,

            /**
             * The only background music audio channel.
             */
            musicChannel: null,

            /**
             * Is music enabled ?
             */
            musicEnabled:true,

            /**
             * Are FX sounds enabled ?
             */
            fxEnabled:true,

            /**
             * A collection of Audio objects.
             */
            audioCache:null,

            /**
             * A cache of empty Audio objects.
             */
            channels:null,

            /**
             * Currently used Audio objects.
             */
            workingChannels:null,

            /**
             * Currently looping Audio objects.
             */
            loopingChannels:[],

            /**
             * available formats for audio elements.
             * the system will load audio files with the extensions in this preferred order.
             */
            audioFormatExtensions : [
                'ogg',
                'wav',
                'x-wav',
                'mp3'
            ],

            currentAudioFormatExtension : 'ogg',

            /**
             * Audio formats.
             * @dict
             */
            audioTypes:{               // supported audio formats. Don't remember where i took them from :S
                'ogg':  'audio/ogg',
                'mp3':  'audio/mpeg;',
                'wav':  'audio/wav',
                'x-wav':'audio/x-wav',
                'mp4':  'audio/mp4"'
            },

            /**
             * Initializes the sound subsystem by creating a fixed number of Audio channels.
             * Every channel registers a handler for sound playing finalization. If a callback is set, the
             * callback function will be called with the associated sound id in the cache.
             *
             * @param numChannels {number} number of channels to pre-create. 8 by default.
             *
             * @return this.
             */
            initialize:function (numChannels ) {

                this.setAudioFormatExtensions( this.audioFormatExtensions );

                this.audioCache = [];
                this.channels = [];
                this.workingChannels = [];

                for (var i = 0; i <= numChannels; i++) {
                    var channel = document.createElement('audio');

                    if (null !== channel) {
                        channel.finished = -1;
                        this.channels.push(channel);
                        var me = this;
                        channel.addEventListener(
                            'ended',
                            // on sound end, set channel to available channels list.
                            function (audioEvent) {
                                var target = audioEvent.target;
                                var i;

                                // remove from workingChannels
                                for (i = 0; i < me.workingChannels.length; i++) {
                                    if (me.workingChannels[i] === target) {
                                        me.workingChannels.splice(i, 1);
                                        break;
                                    }
                                }

                                if (target.caat_callback) {
                                    target.caat_callback(target.caat_id);
                                }

                                // set back to channels.
                                me.channels.push(target);
                            },
                            false
                        );
                    }
                }

                this.musicChannel= this.channels.pop();

                return this;
            },

            setAudioFormatExtensions : function( formats ) {
                this.audioFormatExtensions= formats;
                this.__setCurrentAudioFormatExtension();
                return this;
            },

            __setCurrentAudioFormatExtension : function( ) {

                var audio= new Audio();

                for( var i= 0, l=this.audioFormatExtensions.length; i<l; i+=1 ) {
                    var res= audio.canPlayType( this.audioTypes[this.audioFormatExtensions[i]]).toLowerCase();
                    if ( res!=="no" && res!=="" ) {
                        this.currentAudioFormatExtension= this.audioFormatExtensions[i];
                        console.log("Audio type set to: "+this.currentAudioFormatExtension);
                        return;
                    }
                }

                this.currentAudioFormatExtension= null;
            },

            __getAudioUrl : function( url ) {

                if ( this.currentAudioFormatExtension===null ) {
                    return url;
                }

                var lio= url.lastIndexOf( "." );
                if ( lio<0 ) {
                    console.log("Audio w/o extension: "+url);
                    lio= url.length()-1;
                }

                var uri= url.substring( 0, lio+1 ) + this.currentAudioFormatExtension;
                return uri;
            },

            /**
             * Tries to add an audio tag to the available list of valid audios. The audio is described by a url.
             * @param id {object} an object to associate the audio element (if suitable to be played).
             * @param url {string} a string describing an url.
             * @param endplaying_callback {function} callback to be called upon sound end.
             *
             * @return {boolean} a boolean indicating whether the browser can play this resource.
             *
             * @private
             */
            addAudioFromURL:function (id, url, endplaying_callback) {
                var audio = document.createElement('audio');

                if (null !== audio) {

                    audio.src = this.__getAudioUrl(url);
                    console.log("Loading audio: "+audio.src);
                    audio.preload = "auto";
                    audio.load();
                    if (endplaying_callback) {
                        audio.caat_callback = endplaying_callback;
                        audio.caat_id = id;
                    }
                    this.audioCache.push({ id:id, audio:audio });

                    return true;
                }

                return false;
            },
            /**
             * Tries to add an audio tag to the available list of valid audios. The audio element comes from
             * an HTMLAudioElement.
             * @param id {object} an object to associate the audio element (if suitable to be played).
             * @param audio {HTMLAudioElement} a DOM audio node.
             * @param endplaying_callback {function} callback to be called upon sound end.
             *
             * @return {boolean} a boolean indicating whether the browser can play this resource.
             *
             * @private
             */
            addAudioFromDomNode:function (id, audio, endplaying_callback) {

                var extension = audio.src.substr(audio.src.lastIndexOf('.') + 1);
                if (audio.canPlayType(this.audioTypes[extension])) {
                    if (endplaying_callback) {
                        audio.caat_callback = endplaying_callback;
                        audio.caat_id = id;
                    }
                    this.audioCache.push({ id:id, audio:audio });

                    return true;
                }

                return false;
            },
            /**
             * Adds an elements to the audio cache.
             * @param id {object} an object to associate the audio element (if suitable to be played).
             * @param element {URL|HTMLElement} an url or html audio tag.
             * @param endplaying_callback {function} callback to be called upon sound end.
             *
             * @return {boolean} a boolean indicating whether the browser can play this resource.
             *
             * @private
             */
            addAudioElement:function (id, element, endplaying_callback) {
                if (typeof element === "string") {
                    return this.addAudioFromURL(id, element, endplaying_callback);
                } else {
                    try {
                        if (element instanceof HTMLAudioElement) {
                            return this.addAudioFromDomNode(id, element, endplaying_callback);
                        }
                    }
                    catch (e) {
                    }
                }

                return false;
            },
            /**
             * creates an Audio object and adds it to the audio cache.
             * This function expects audio data described by two elements, an id and an object which will
             * describe an audio element to be associated with the id. The object will be of the form
             * array, dom node or a url string.
             *
             * <p>
             * The audio element can be one of the two forms:
             *
             * <ol>
             *  <li>Either an HTMLAudioElement/Audio object or a string url.
             *  <li>An array of elements of the previous form.
             * </ol>
             *
             * <p>
             * When the audio attribute is an array, this function will iterate throught the array elements
             * until a suitable audio element to be played is found. When this is the case, the other array
             * elements won't be taken into account. The valid form of using this addAudio method will be:
             *
             * <p>
             * 1.<br>
             * addAudio( id, url } ). In this case, if the resource pointed by url is
             * not suitable to be played (i.e. a call to the Audio element's canPlayType method return 'no')
             * no resource will be added under such id, so no sound will be played when invoking the play(id)
             * method.
             * <p>
             * 2.<br>
             * addAudio( id, dom_audio_tag ). In this case, the same logic than previous case is applied, but
             * this time, the parameter url is expected to be an audio tag present in the html file.
             * <p>
             * 3.<br>
             * addAudio( id, [array_of_url_or_domaudiotag] ). In this case, the function tries to locate a valid
             * resource to be played in any of the elements contained in the array. The array element's can
             * be any type of case 1 and 2. As soon as a valid resource is found, it will be associated to the
             * id in the valid audio resources to be played list.
             *
             * @return this
             */
            addAudio:function (id, array_of_url_or_domnodes, endplaying_callback) {

                if (array_of_url_or_domnodes instanceof Array) {
                    /*
                     iterate throught array elements until we can safely add an audio element.
                     */
                    for (var i = 0; i < array_of_url_or_domnodes.length; i++) {
                        if (this.addAudioElement(id, array_of_url_or_domnodes[i], endplaying_callback)) {
                            break;
                        }
                    }
                } else {
                    this.addAudioElement(id, array_of_url_or_domnodes, endplaying_callback);
                }

                return this;
            },
            /**
             * Returns an audio object.
             * @param aId {object} the id associated to the target Audio object.
             * @return {object} the HTMLAudioElement addociated to the given id.
             */
            getAudio:function (aId) {
                for (var i = 0; i < this.audioCache.length; i++) {
                    if (this.audioCache[i].id === aId) {
                        return this.audioCache[i].audio;
                    }
                }

                return null;
            },

            stopMusic : function() {
                this.musicChannel.pause();
            },

            playMusic : function(id) {
                if (!this.musicEnabled) {
                    return null;
                }

                var audio_in_cache = this.getAudio(id);
                // existe el audio, y ademas hay un canal de audio disponible.
                if (null !== audio_in_cache) {
                    var audio =this.musicChannel;
                    if (null !== audio) {
                        audio.src = audio_in_cache.src;
                        audio.preload = "auto";

                        if (this.isFirefox) {
                            audio.addEventListener(
                                'ended',
                                // on sound end, restart music.
                                function (audioEvent) {
                                    var target = audioEvent.target;
                                    target.currentTime = 0;
                                },
                                false
                            );
                        } else {
                            audio.loop = true;
                        }
                        audio.load();
                        audio.play();
                        return audio;
                    }
                }

                return null;
            },

            /**
             * Set an audio object volume.
             * @param id {object} an audio Id
             * @param volume {number} volume to set. The volume value is not checked.
             *
             * @return this
             */
            setVolume:function (id, volume) {
                var audio = this.getAudio(id);
                if (null != audio) {
                    audio.volume = volume;
                }

                return this;
            },

            /**
             * Plays an audio file from the cache if any sound channel is available.
             * The playing sound will occupy a sound channel and when ends playing will leave
             * the channel free for any other sound to be played in.
             * @param id {object} an object identifying a sound in the sound cache.
             * @return { id: {Object}, audio: {(Audio|HTMLAudioElement)} }
             */
            play:function (id) {
                if (!this.fxEnabled) {
                    return null;
                }

                var audio = this.getAudio(id);
                // existe el audio, y ademas hay un canal de audio disponible.
                if (null !== audio && this.channels.length > 0) {
                    var channel = this.channels.shift();
                    channel.src = audio.src;
//                    channel.load();
                    channel.volume = audio.volume;
                    channel.play();
                    this.workingChannels.push(channel);
                } else {
                    console.log("Can't play audio: "+id);
                }

                return audio;
            },

            /**
             * cancel all instances of a sound identified by id. This id is the value set
             * to identify a sound.
             * @param id
             * @return {*}
             */
            cancelPlay : function(id) {

                for( var i=0 ; this.workingChannels.length; i++ ) {
                    var audio= this.workingChannels[i];
                    if ( audio.caat_id===id ) {
                        audio.pause();
                        this.channels.push(audio);
                        this.workingChannels.splice(i,1);
                    }
                }

                return this;
            },

            /**
             * cancel a channel sound
             * @param audioObject
             * @return {*}
             */
            cancelPlayByChannel : function(audioObject) {

                for( var i=0 ; this.workingChannels.length; i++ ) {
                    if ( this.workingChannels[i]===audioObject ) {
                        this.channels.push(audioObject);
                        this.workingChannels.splice(i,1);
                        return this;
                    }
                }

                return this;
            },

            /**
             * This method creates a new AudioChannel to loop the sound with.
             * It returns an Audio object so that the developer can cancel the sound loop at will.
             * The user must call <code>pause()</code> method to stop playing a loop.
             * <p>
             * Firefox does not honor the loop property, so looping is performed by attending end playing
             * event on audio elements.
             *
             * @return {HTMLElement} an Audio instance if a valid sound id is supplied. Null otherwise
             */
            loop:function (id) {

                if (!this.musicEnabled) {
                    return null;
                }

                var audio_in_cache = this.getAudio(id);
                // existe el audio, y ademas hay un canal de audio disponible.
                if (null !== audio_in_cache) {
                    var audio = document.createElement('audio');
                    if (null !== audio) {
                        audio.src = audio_in_cache.src;
                        audio.preload = "auto";

                        if (this.isFirefox) {
                            audio.addEventListener(
                                'ended',
                                // on sound end, set channel to available channels list.
                                function (audioEvent) {
                                    var target = audioEvent.target;
                                    target.currentTime = 0;
                                },
                                false
                            );
                        } else {
                            audio.loop = true;
                        }
                        audio.load();
                        audio.play();
                        this.loopingChannels.push(audio);
                        return audio;
                    }
                }

                return null;
            },
            /**
             * Cancel all playing audio channels
             * Get back the playing channels to available channel list.
             *
             * @return this
             */
            endSound:function () {
                var i;
                for (i = 0; i < this.workingChannels.length; i++) {
                    this.workingChannels[i].pause();
                    this.channels.push(this.workingChannels[i]);
                }

                for (i = 0; i < this.loopingChannels.length; i++) {
                    this.loopingChannels[i].pause();
                }

                this.workingChannels= [];
                this.loopingChannels= [];

                this.stopMusic();

                return this;
            },
            setSoundEffectsEnabled:function (enable) {
                this.fxEnabled = enable;
                for (var i = 0; i < this.loopingChannels.length; i++) {
                    if (enable) {
                        this.loopingChannels[i].play();
                    } else {
                        this.loopingChannels[i].pause();
                    }
                }
                return this;
            },
            isSoundEffectsEnabled:function () {
                return this.fxEnabled;
            },
            setMusicEnabled:function (enable) {
                this.musicEnabled = enable;
                this.stopMusic();
                return this;
            },
            isMusicEnabled:function () {
                return this.musicEnabled;
            }
        }
    }
});
/**
 * See LICENSE file.
 *
 **/
CAAT.Module({

    /**
     * @name Storage
     * @memberOf CAAT.Module
     * @namespace
     */

    /**
     * @name LocalStorage
     * @memberOf CAAT.Module.Storage
     * @namespace
     */

    defines : "CAAT.Module.Storage.LocalStorage",
    constants : {

        /**
         * @lends CAAT.Module.Storage.LocalStorage
         */

        /**
         * Stores an object in local storage. The data will be saved as JSON.stringify.
         * @param key {string} key to store data under.
         * @param data {object} an object.
         * @return this
         *
         * @static
         */
        save : function( key, data ) {
            try {
                localStorage.setItem( key, JSON.stringify(data) );
            } catch(e) {
                // eat it
            }
            return this;
        },
        /**
         * Retrieve a value from local storage.
         * @param key {string} the key to retrieve.
         * @return {object} object stored under the key parameter.
         *
         * @static
         */
        load : function( key, defValue ) {
            try {
                var v= localStorage.getItem( key );

                return null===v ? defValue : JSON.parse(v);
            } catch(e) {
                return null;
            }
        },

        /**
         * Removes a value stored in local storage.
         * @param key {string}
         * @return this
         *
         * @static
         */
        remove : function( key ) {
            try {
                localStorage.removeItem(key);
            } catch(e) {
                // eat it
            }
            return this;
        }
    },
    extendsWith : {

    }

});
/**
 * See LICENSE file.
 *
 * @author: Mario Gonzalez (@onedayitwilltake) and Ibon Tolosana (@hyperandroid)
 *
 * Helper classes for color manipulation.
 *
 **/

CAAT.Module({

    /**
     * @name ColorUtil
     * @memberOf CAAT.Module
     * @namespace
     */

    /**
     * @name Color
     * @memberOf CAAT.Module.ColorUtil
     * @namespace
     */


    defines:"CAAT.Module.ColorUtil.Color",
    depends:[
    ],
    constants:{

        /**
         * @lends CAAT.Module.ColorUtil.Color
         */

        /**
         * Enumeration to define types of color ramps.
         * @enum {number}
         */
        RampEnumeration:{
            RAMP_RGBA:0,
            RAMP_RGB:1,
            RAMP_CHANNEL_RGB:2,
            RAMP_CHANNEL_RGBA:3,
            RAMP_CHANNEL_RGB_ARRAY:4,
            RAMP_CHANNEL_RGBA_ARRAY:5
        },

        /**
         * HSV to RGB color conversion
         * <p>
         * H runs from 0 to 360 degrees<br>
         * S and V run from 0 to 100
         * <p>
         * Ported from the excellent java algorithm by Eugene Vishnevsky at:
         * http://www.cs.rit.edu/~ncs/color/t_convert.html
         *
         * @static
         */
        hsvToRgb:function (h, s, v) {
            var r, g, b, i, f, p, q, t;

            // Make sure our arguments stay in-range
            h = Math.max(0, Math.min(360, h));
            s = Math.max(0, Math.min(100, s));
            v = Math.max(0, Math.min(100, v));

            // We accept saturation and value arguments from 0 to 100 because that's
            // how Photoshop represents those values. Internally, however, the
            // saturation and value are calculated from a range of 0 to 1. We make
            // That conversion here.
            s /= 100;
            v /= 100;

            if (s === 0) {
                // Achromatic (grey)
                r = g = b = v;
                return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
            }

            h /= 60; // sector 0 to 5
            i = Math.floor(h);
            f = h - i; // factorial part of h
            p = v * (1 - s);
            q = v * (1 - s * f);
            t = v * (1 - s * (1 - f));

            switch (i) {
                case 0:
                    r = v;
                    g = t;
                    b = p;
                    break;

                case 1:
                    r = q;
                    g = v;
                    b = p;
                    break;

                case 2:
                    r = p;
                    g = v;
                    b = t;
                    break;

                case 3:
                    r = p;
                    g = q;
                    b = v;
                    break;

                case 4:
                    r = t;
                    g = p;
                    b = v;
                    break;

                default: // case 5:
                    r = v;
                    g = p;
                    b = q;
            }

            return new CAAT.Module.ColorUtil.Color(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
        },

        /**
         * Interpolate the color between two given colors. The return value will be a calculated color
         * among the two given initial colors which corresponds to the 'step'th color of the 'nsteps'
         * calculated colors.
         * @param r0 {number} initial color red component.
         * @param g0 {number} initial color green component.
         * @param b0 {number} initial color blue component.
         * @param r1 {number} final color red component.
         * @param g1 {number} final color green component.
         * @param b1 {number} final color blue component.
         * @param nsteps {number} number of colors to calculate including the two given colors. If 16 is passed as value,
         * 14 colors plus the two initial ones will be calculated.
         * @param step {number} return this color index of all the calculated colors.
         *
         * @return { {r{number}, g{number}, b{number}} } return an object with the new calculated color components.
         * @static
         */
        interpolate:function (r0, g0, b0, r1, g1, b1, nsteps, step) {

            var r, g, b;

            if (step <= 0) {
                return {
                    r:r0,
                    g:g0,
                    b:b0
                };
            } else if (step >= nsteps) {
                return {
                    r:r1,
                    g:g1,
                    b:b1
                };
            }

            r = (r0 + (r1 - r0) / nsteps * step) >> 0;
            g = (g0 + (g1 - g0) / nsteps * step) >> 0;
            b = (b0 + (b1 - b0) / nsteps * step) >> 0;

            if (r > 255) {
                r = 255;
            } else if (r < 0) {
                r = 0;
            }
            if (g > 255) {
                g = 255;
            } else if (g < 0) {
                g = 0;
            }
            if (b > 255) {
                b = 255;
            } else if (b < 0) {
                b = 0;
            }

            return {
                r:r,
                g:g,
                b:b
            };
        },

        /**
         * Generate a ramp of colors from an array of given colors.
         * @param fromColorsArray {[number]} an array of colors. each color is defined by an integer number from which
         * color components will be extracted. Be aware of the alpha component since it will also be interpolated for
         * new colors.
         * @param rampSize {number} number of colors to produce.
         * @param returnType {CAAT.ColorUtils.RampEnumeration} a value of CAAT.ColorUtils.RampEnumeration enumeration.
         *
         * @return { [{number},{number},{number},{number}] } an array of integers each of which represents a color of
         * the calculated color ramp.
         *
         * @static
         */
        makeRGBColorRamp:function (fromColorsArray, rampSize, returnType) {

            var ramp = [], nc = fromColorsArray.length - 1, chunk = rampSize / nc, i, j,
                na, nr, ng, nb,
                c, a0, r0, g0, b0,
                c1, a1, r1, g1, b1,
                da, dr, dg, db;

            for (i = 0; i < nc; i += 1) {
                c = fromColorsArray[i];
                a0 = (c >> 24) & 0xff;
                r0 = (c & 0xff0000) >> 16;
                g0 = (c & 0xff00) >> 8;
                b0 = c & 0xff;

                c1 = fromColorsArray[i + 1];
                a1 = (c1 >> 24) & 0xff;
                r1 = (c1 & 0xff0000) >> 16;
                g1 = (c1 & 0xff00) >> 8;
                b1 = c1 & 0xff;

                da = (a1 - a0) / chunk;
                dr = (r1 - r0) / chunk;
                dg = (g1 - g0) / chunk;
                db = (b1 - b0) / chunk;

                for (j = 0; j < chunk; j += 1) {
                    na = (a0 + da * j) >> 0;
                    nr = (r0 + dr * j) >> 0;
                    ng = (g0 + dg * j) >> 0;
                    nb = (b0 + db * j) >> 0;

                    var re = CAAT.Module.ColorUtil.Color.RampEnumeration;

                    switch (returnType) {
                        case re.RAMP_RGBA:
                            ramp.push('argb(' + na + ',' + nr + ',' + ng + ',' + nb + ')');
                            break;
                        case re.RAMP_RGB:
                            ramp.push('rgb(' + nr + ',' + ng + ',' + nb + ')');
                            break;
                        case re.RAMP_CHANNEL_RGB:
                            ramp.push(0xff000000 | nr << 16 | ng << 8 | nb);
                            break;
                        case re.RAMP_CHANNEL_RGBA:
                            ramp.push(na << 24 | nr << 16 | ng << 8 | nb);
                            break;
                        case re.RAMP_CHANNEL_RGBA_ARRAY:
                            ramp.push([ nr, ng, nb, na ]);
                            break;
                        case re.RAMP_CHANNEL_RGB_ARRAY:
                            ramp.push([ nr, ng, nb ]);
                            break;
                    }
                }
            }

            return ramp;

        },

        random:function () {
            var a = '0123456789abcdef';
            var c = '#';
            for (var i = 0; i < 3; i++) {
                c += a[ (Math.random() * a.length) >> 0 ];
            }
            return c;
        }
    },

    extendsWith:{
        __init:function (r, g, b) {
            this.r = r || 255;
            this.g = g || 255;
            this.b = b || 255;
            return this;
        },

        r:255,
        g:255,
        b:255,

        /**
         * Get color hexadecimal representation.
         * @return {string} a string with color hexadecimal representation.
         */
        toHex:function () {
            // See: http://jsperf.com/rgb-decimal-to-hex/5
            return ('000000' + ((this.r << 16) + (this.g << 8) + this.b).toString(16)).slice(-6);
        }
    }
});
/**
 * See LICENSE file.
 *
 * Get realtime Debug information of CAAT's activity.
 * Set CAAT.DEBUG=1 before any CAAT.Director object creation.
 * This class creates a DOM node called 'caat-debug' and associated styles
 * The debug panel is minimized by default and shows short information. It can be expanded and minimized again by clicking on it
 *
 */

CAAT.Module( {

    /**
     * @name Debug
     * @memberOf CAAT.Module
     * @namespace
     */

    /**
     * @name Debug
     * @memberOf CAAT.Module.Debug
     * @constructor
     */

    defines : "CAAT.Module.Debug.Debug",
    depends : [
        "CAAT.Event.AnimationLoop"
    ],
    extendsWith : {

        /**
         * @lends CAAT.Module.Debug.Debug.prototype
         */

        width:              0,
        height:             0,
        canvas:             null,
        ctx:                null,
        statistics:         null,
        framerate:          null,
        textContainer:      null,
        textFPS:            null,
        textEntitiesTotal:  null,
        textEntitiesActive: null,
        textDraws:          null,
        textDrawTime:       null,
        textRAFTime:        null,
        textDirtyRects:     null,
        textDiscardDR:      null,

        frameTimeAcc :      0,
        frameRAFAcc :       0,

        canDebug:           false,

        SCALE:  60,

        debugTpl: 
            "    <style type=\"text/css\">"+
            "        #caat-debug {"+
            "            z-index: 10000;"+
            "            position:fixed;"+
            "            bottom:0;"+
            "            left:0;"+
            "            width:100%;"+
            "            background-color: rgba(0,0,0,0.8);"+
            "        }"+
            "        #caat-debug.caat_debug_max {"+
            "            margin-bottom: 0px;"+
            "        }"+
            "        .caat_debug_bullet {"+
            "            display:inline-block;"+
            "            background-color:#f00;"+
            "            width:8px;"+
            "            height:8px;"+
            "            border-radius: 4px;"+
            "            margin-left:10px;"+
            "            margin-right:2px;"+
            "        }"+
            "        .caat_debug_description {"+
            "            font-size:11px;"+
            "            font-family: helvetica, arial;"+
            "            color: #aaa;"+
            "            display: inline-block;"+
            "        }"+
            "        .caat_debug_value {"+
            "            font-size:11px;"+
            "            font-family: helvetica, arial;"+
            "            color: #fff;"+
            "            width:25px;"+
            "            text-align: right;"+
            "            display: inline-block;"+
            "            margin-right: .3em;"+
            "        }"+
            "        .caat_debug_indicator {"+
            "            float: right;"+
            "        }"+
            "        #debug_tabs {"+
            "            border-top: 1px solid #888;"+
            "            height:25px;"+
            "        }"+
            "        .tab_max_min {"+
            "            font-family: helvetica, arial;"+
            "            font-size: 12px;"+
            "            font-weight: bold;"+
            "            color: #888;"+
            "            border-right: 1px solid #888;"+
            "            float: left;"+
            "            cursor: pointer;"+
            "            padding-left: 5px;"+
            "            padding-right: 5px;"+
            "            padding-top: 5px;"+
            "            height: 20px;"+
            "        }"+
            "        .debug_tabs_content_hidden {"+
            "            display: none;"+
            "            width: 100%;"+
            "        }"+
            "        .debug_tabs_content_visible {"+
            "            display: block;"+
            "            width: 100%;"+
            "        }"+
            "        .checkbox_enabled {"+
            "            display:inline-block;"+
            "            background-color:#eee;"+
            "            border: 1px solid #eee;"+
            "            width:6px;"+
            "            height:8px;"+
            "            margin-left:12px;"+
            "            margin-right:2px;"+
            "            cursor: pointer;"+
            "        }"+
            "        .checkbox_disabled {"+
            "            display:inline-block;"+
            "            width:6px;"+
            "            height:8px;"+
            "            background-color: #333;"+
            "            border: 1px solid #eee;"+
            "            margin-left:12px;"+
            "            margin-right:2px;"+
            "            cursor: pointer;"+
            "        }"+
            "        .checkbox_description {"+
            "            font-size:11px;"+
            "            font-family: helvetica, arial;"+
            "            color: #fff;"+
            "        }"+
            "        .debug_tab {"+
            "            font-family: helvetica, arial;"+
            "            font-size: 12px;"+
            "            color: #fff;"+
            "            border-right: 1px solid #888;"+
            "            float: left;"+
            "            padding-left: 5px;"+
            "            padding-right: 5px;"+
            "            height: 20px;"+
            "            padding-top: 5px;"+
            "            cursor: default;"+
            "        }"+
            "        .debug_tab_selected {"+
            "            background-color: #444;"+
            "            cursor: default;"+
            "        }"+
            "        .debug_tab_not_selected {"+
            "            background-color: #000;"+
            "            cursor: pointer;"+
            "        }"+
            "    </style>"+
            "    <div id=\"caat-debug\">"+
            "        <div id=\"debug_tabs\">"+
            "            <span class=\"tab_max_min\" onCLick=\"javascript: var debug = document.getElementById('debug_tabs_content');if (debug.className === 'debug_tabs_content_visible') {debug.className = 'debug_tabs_content_hidden'} else {debug.className = 'debug_tabs_content_visible'}\"> CAAT Debug panel </span>"+
            "            <span id=\"caat-debug-tab0\" class=\"debug_tab debug_tab_selected\">Performance</span>"+
            "            <span id=\"caat-debug-tab1\" class=\"debug_tab debug_tab_not_selected\">Controls</span>"+
            "            <span class=\"caat_debug_indicator\">"+
            "                <span class=\"caat_debug_bullet\" style=\"background-color:#0f0;\"></span>"+
            "                <span class=\"caat_debug_description\">Draw Time: </span>"+
            "                <span class=\"caat_debug_value\" id=\"textDrawTime\">5.46</span>"+
            "                <span class=\"caat_debug_description\">ms.</span>"+
            "            </span>"+
            "            <span class=\"caat_debug_indicator\">"+
            "                <span class=\"caat_debug_bullet\" style=\"background-color:#f00;\"></span>"+
            "                <span class=\"caat_debug_description\">FPS: </span>"+
            "                <span class=\"caat_debug_value\" id=\"textFPS\">48</span>"+
            "            </span>"+
            "        </div>"+
            "        <div id=\"debug_tabs_content\" class=\"debug_tabs_content_hidden\">"+
            "            <div id=\"caat-debug-tab0-content\">"+
            "                <canvas id=\"caat-debug-canvas\" height=\"60\"></canvas>"+
            "                <div>"+
            "                    <span>"+
            "                        <span class=\"caat_debug_bullet\" style=\"background-color:#0f0;\"></span>"+
            "                        <span class=\"caat_debug_description\">RAF Time:</span>"+
            "                        <span class=\"caat_debug_value\" id=\"textRAFTime\">20.76</span>"+
            "                        <span class=\"caat_debug_description\">ms.</span>"+
            "                    </span>"+
            "                    <span>"+
            "                        <span class=\"caat_debug_bullet\" style=\"background-color:#0ff;\"></span>"+
            "                        <span class=\"caat_debug_description\">Entities Total: </span>"+
            "                        <span class=\"caat_debug_value\" id=\"textEntitiesTotal\">41</span>"+
            "                    </span>"+
            "                    <span>"+
            "                        <span class=\"caat_debug_bullet\" style=\"background-color:#0ff;\"></span>"+
            "                        <span class=\"caat_debug_description\">Entities Active: </span>"+
            "                        <span class=\"caat_debug_value\" id=\"textEntitiesActive\">37</span>"+
            "                    </span>"+
            "                    <span>"+
            "                        <span class=\"caat_debug_bullet\" style=\"background-color:#00f;\"></span>"+
            "                        <span class=\"caat_debug_description\">Draws: </span>"+
            "                        <span class=\"caat_debug_value\" id=\"textDraws\">0</span>"+
            "                    </span>"+
            "                    <span>"+
            "                        <span class=\"caat_debug_bullet\" style=\"background-color:#00f;\"></span>"+
            "                        <span class=\"caat_debug_description\">DirtyRects: </span>"+
            "                        <span class=\"caat_debug_value\" id=\"textDirtyRects\">0</span>"+
            "                    </span>"+
            "                    <span>"+
            "                        <span class=\"caat_debug_bullet\" style=\"background-color:#00f;\"></span>"+
            "                        <span class=\"caat_debug_description\">Discard DR: </span>"+
            "                        <span class=\"caat_debug_value\" id=\"textDiscardDR\">0</span>"+
            "                    </span>"+
            "                </div>"+
            "            </div>"+
            "            <div id=\"caat-debug-tab1-content\">"+
            "                <div>"+
            "                    <div>"+
            "                        <span id=\"control-sound\"></span>"+
            "                        <span class=\"checkbox_description\">Sound</span>"+
            "                    </div>"+
            "                    <div>"+
            "                        <span id=\"control-music\"></span>"+
            "                        <span class=\"checkbox_description\">Music</span>"+
            "                    </div>"+
            "                    <div>"+
            "                        <span id=\"control-aabb\"></span>"+
            "                        <span class=\"checkbox_description\">AA Bounding Boxes</span>"+
            "                    </div>"+
            "                    <div>"+
            "                        <span id=\"control-bb\"></span>"+
            "                        <span class=\"checkbox_description\">Bounding Boxes</span>"+
            "                    </div>"+
            "                    <div>"+
            "                        <span id=\"control-dr\"></span>"+
            "                        <span class=\"checkbox_description\">Dirty Rects</span>"+
            "                    </div>"+
            "                </div>"+
            "            </div>"+
            "        </div>"+
            "    </div>",


        setScale : function(s) {
            this.scale= s;
            return this;
        },

        initialize: function(w,h) {
            w= window.innerWidth;

            this.width= w;
            this.height= h;

            this.framerate = {
                refreshInterval: CAAT.FPS_REFRESH || 500,   // refresh every ? ms, updating too quickly gives too large rounding errors
                frames: 0,                                  // number offrames since last refresh
                timeLastRefresh: 0,                         // When was the framerate counter refreshed last
                fps: 0,                                     // current framerate
                prevFps: -1,                                // previously drawn FPS
                fpsMin: 1000,                               // minimum measured framerate
                fpsMax: 0                                   // maximum measured framerate
            };

            var debugContainer= document.getElementById('caat-debug');
            if (!debugContainer) {
                var wrap = document.createElement('div');
                wrap.innerHTML=this.debugTpl;
                document.body.appendChild(wrap);

                eval( ""+
                    " var __x= CAAT;" +
                    "        function initCheck( name, bool, callback ) {"+
                    "            var elem= document.getElementById(name);"+
                    "            if ( elem ) {"+
                    "                elem.className= (bool) ? \"checkbox_enabled\" : \"checkbox_disabled\";"+
                    "                if ( callback ) {"+
                    "                    elem.addEventListener( \"click\", (function(elem, callback) {"+
                    "                        return function(e) {"+
                    "                            elem.__value= !elem.__value;"+
                    "                            elem.className= (elem.__value) ? \"checkbox_enabled\" : \"checkbox_disabled\";"+
                    "                            callback(e,elem.__value);"+
                    "                        }"+
                    "                    })(elem, callback), false );"+
                    "                }"+
                    "                elem.__value= bool;"+
                    "            }"+
                    "        }"+
                    "        function setupTabs() {"+
                    "            var numTabs=0;"+
                    "            var elem;"+
                    "            var elemContent;"+
                    "            do {"+
                    "                elem= document.getElementById(\"caat-debug-tab\"+numTabs);"+
                    "                if ( elem ) {"+
                    "                    elemContent= document.getElementById(\"caat-debug-tab\"+numTabs+\"-content\");"+
                    "                    if ( elemContent ) {"+
                    "                        elemContent.style.display= numTabs===0 ? 'block' : 'none';"+
                    "                        elem.className= numTabs===0 ? \"debug_tab debug_tab_selected\" : \"debug_tab debug_tab_not_selected\";"+
                    "                        elem.addEventListener( \"click\", (function(tabIndex) {"+
                    "                            return function(e) {"+
                    "                                for( var i=0; i<numTabs; i++ ) {"+
                    "                                    var _elem= document.getElementById(\"caat-debug-tab\"+i);"+
                    "                                    var _elemContent= document.getElementById(\"caat-debug-tab\"+i+\"-content\");"+
                    "                                    _elemContent.style.display= i===tabIndex ? 'block' : 'none';"+
                    "                                    _elem.className= i===tabIndex ? \"debug_tab debug_tab_selected\" : \"debug_tab debug_tab_not_selected\";"+
                    "                                }"+
                    "                            }"+
                    "                        })(numTabs), false );"+
                    "                    }"+
                    "                    numTabs++;"+
                    "                }"+
                    "            } while( elem );"+
                    "        }"+
                    "        initCheck( \"control-sound\", __x.director[0].isSoundEffectsEnabled(), function(e, bool) {"+
                    "            __x.director[0].setSoundEffectsEnabled(bool);"+
                    "        } );"+
                    "        initCheck( \"control-music\", __x.director[0].isMusicEnabled(), function(e, bool) {"+
                    "            __x.director[0].setMusicEnabled(bool);"+
                    "        } );"+
                    "        initCheck( \"control-aabb\", CAAT.DEBUGBB, function(e,bool) {"+
                    "            CAAT.DEBUGAABB= bool;"+
                    "            __x.director[0].currentScene.dirty= true;"+
                    "        } );"+
                    "        initCheck( \"control-bb\", CAAT.DEBUGBB, function(e,bool) {"+
                    "            CAAT.DEBUGBB= bool;"+
                    "            if ( bool ) {"+
                    "                CAAT.DEBUGAABB= true;"+
                    "            }"+
                    "            __x.director[0].currentScene.dirty= true;"+
                    "        } );"+
                    "        initCheck( \"control-dr\", CAAT.DEBUG_DIRTYRECTS , function( e,bool ) {"+
                    "            CAAT.DEBUG_DIRTYRECTS= bool;"+
                    "        });"+
                    "        setupTabs();" );

            }

            this.canvas= document.getElementById('caat-debug-canvas');
            if ( null===this.canvas ) {
                this.canDebug= false;
                return;
            }

            this.canvas.width= w;
            this.canvas.height=h;
            this.ctx= this.canvas.getContext('2d');

            this.ctx.fillStyle= '#000';
            this.ctx.fillRect(0,0,this.width,this.height);

            this.textFPS= document.getElementById("textFPS");
            this.textDrawTime= document.getElementById("textDrawTime");
            this.textRAFTime= document.getElementById("textRAFTime");
            this.textEntitiesTotal= document.getElementById("textEntitiesTotal");
            this.textEntitiesActive= document.getElementById("textEntitiesActive");
            this.textDraws= document.getElementById("textDraws");
            this.textDirtyRects= document.getElementById("textDirtyRects");
            this.textDiscardDR= document.getElementById("textDiscardDR");


            this.canDebug= true;

            return this;
        },

        debugInfo : function( statistics ) {
            this.statistics= statistics;

            var cc= CAAT;

            this.frameTimeAcc+= cc.FRAME_TIME;
            this.frameRAFAcc+= cc.REQUEST_ANIMATION_FRAME_TIME;

            /* Update the framerate counter */
            this.framerate.frames++;
            var tt= new Date().getTime() ;
            if ( tt> this.framerate.timeLastRefresh + this.framerate.refreshInterval ) {
                this.framerate.fps = ( ( this.framerate.frames * 1000 ) / ( tt - this.framerate.timeLastRefresh ) ) | 0;
                this.framerate.fpsMin = this.framerate.frames > 0 ? Math.min( this.framerate.fpsMin, this.framerate.fps ) : this.framerate.fpsMin;
                this.framerate.fpsMax = Math.max( this.framerate.fpsMax, this.framerate.fps );

                this.textFPS.innerHTML= this.framerate.fps;

                var value= ((this.frameTimeAcc*100/this.framerate.frames)|0)/100;
                this.frameTimeAcc=0;
                this.textDrawTime.innerHTML= value;

                var value2= ((this.frameRAFAcc*100/this.framerate.frames)|0)/100;
                this.frameRAFAcc=0;
                this.textRAFTime.innerHTML= value2;

                this.framerate.timeLastRefresh = tt;
                this.framerate.frames = 0;

                this.paint(value2);
            }

            this.textEntitiesTotal.innerHTML= this.statistics.size_total;
            this.textEntitiesActive.innerHTML= this.statistics.size_active;
            this.textDirtyRects.innerHTML= this.statistics.size_dirtyRects;
            this.textDraws.innerHTML= this.statistics.draws;
            this.textDiscardDR.innerHTML= this.statistics.size_discarded_by_dirty_rects;
        },

        paint : function( rafValue ) {
            var ctx= this.ctx;
            var t=0;

            ctx.drawImage(
                this.canvas,
                1, 0, this.width-1, this.height,
                0, 0, this.width-1, this.height );

            ctx.strokeStyle= 'black';
            ctx.beginPath();
            ctx.moveTo( this.width-.5, 0 );
            ctx.lineTo( this.width-.5, this.height );
            ctx.stroke();

            ctx.strokeStyle= '#a22';
            ctx.beginPath();
            t= this.height-((20/this.SCALE*this.height)>>0)-.5;
            ctx.moveTo( .5, t );
            ctx.lineTo( this.width+.5, t );
            ctx.stroke();

            ctx.strokeStyle= '#aa2';
            ctx.beginPath();
            t= this.height-((30/this.SCALE*this.height)>>0)-.5;
            ctx.moveTo( .5, t );
            ctx.lineTo( this.width+.5, t );
            ctx.stroke();

            var fps = Math.min( this.height-(this.framerate.fps/this.SCALE*this.height), 59 );
            if (-1===this.framerate.prevFps) {
                this.framerate.prevFps= fps|0;
            }

            ctx.strokeStyle= '#0ff';//this.framerate.fps<15 ? 'red' : this.framerate.fps<30 ? 'yellow' : 'green';
            ctx.beginPath();
            ctx.moveTo( this.width, (fps|0)-.5 );
            ctx.lineTo( this.width, this.framerate.prevFps-.5 );
            ctx.stroke();

            this.framerate.prevFps= fps;


            var t1= ((this.height-(rafValue/this.SCALE*this.height))>>0)-.5;
            ctx.strokeStyle= '#ff0';
            ctx.beginPath();
            ctx.moveTo( this.width, t1 );
            ctx.lineTo( this.width, t1 );
            ctx.stroke();
        }
    }

});
/**
 * See LICENSE file.
 *
 **/

CAAT.Module({

    /**
     * @name Font
     * @memberOf CAAT.Module
     * @namespace
     */

    /**
     * @name Font
     * @memberOf CAAT.Module.Font
     * @constructor
     */

    defines : "CAAT.Module.Font.Font",
    aliases : "CAAT.Font",
    depends : [
        "CAAT.Foundation.SpriteImage"
    ],
    constants: {

        /**
         * @lends CAAT.Module.Font.Font
         */

        getFontMetrics:function (font) {
            var ret;
            if (CAAT.CSS_TEXT_METRICS) {
                try {
                    ret = CAAT.Module.Font.Font.getFontMetricsCSS(font);
                    return ret;
                } catch (e) {

                }
            }

            return CAAT.Module.Font.Font.getFontMetricsNoCSS(font);
        },

        getFontMetricsNoCSS:function (font) {

            var re = /(\d+)p[x|t]\s*/i;
            var res = re.exec(font);

            var height;

            if (!res) {
                height = 32;     // no px or pt value in font. assume 32.)
            } else {
                height = res[1] | 0;
            }

            var ascent = height - 1;
            var h = (height + height * .2) | 0;
            return {
                height:h,
                ascent:ascent,
                descent:h - ascent
            }

        },

        /**
         * Totally ripped from:
         *
         * jQuery (offset function)
         * Daniel Earwicker: http://stackoverflow.com/questions/1134586/how-can-you-find-the-height-of-text-on-an-html-canvas
         *
         * @param font
         * @return {*}
         */
        getFontMetricsCSS:function (font) {

            function offset(elem) {

                var box, docElem, body, win, clientTop, clientLeft, scrollTop, scrollLeft, top, left;
                var doc = elem && elem.ownerDocument;
                docElem = doc.documentElement;

                box = elem.getBoundingClientRect();
                //win = getWindow( doc );

                body = document.body;
                win = doc.nodeType === 9 ? doc.defaultView || doc.parentWindow : false;

                clientTop = docElem.clientTop || body.clientTop || 0;
                clientLeft = docElem.clientLeft || body.clientLeft || 0;
                scrollTop = win.pageYOffset || docElem.scrollTop;
                scrollLeft = win.pageXOffset || docElem.scrollLeft;
                top = box.top + scrollTop - clientTop;
                left = box.left + scrollLeft - clientLeft;

                return { top:top, left:left };
            }

            try {
                var text = document.createElement("span");
                text.style.font = font;
                text.innerHTML = "Hg";

                var block = document.createElement("div");
                block.style.display = "inline-block";
                block.style.width = "1px";
                block.style.heigh = "0px";

                var div = document.createElement("div");
                div.appendChild(text);
                div.appendChild(block);


                var body = document.body;
                body.appendChild(div);

                try {

                    var result = {};

                    block.style.verticalAlign = 'baseline';
                    result.ascent = offset(block).top - offset(text).top;

                    block.style.verticalAlign = 'bottom';
                    result.height = offset(block).top - offset(text).top;

                    result.ascent = Math.ceil(result.ascent);
                    result.height = Math.ceil(result.height);

                    result.descent = result.height - result.ascent;

                    return result;

                } finally {
                    body.removeChild(div);
                }
            } catch (e) {
                return null;
            }
        }
    },
    extendsWith:function () {

        var UNKNOWN_CHAR_WIDTH = 10;

        return {

            /**
             * @lends CAAT.Module.Font.Font.prototype
             */

            fontSize:10,
            fontSizeUnit:"px",
            font:'Sans-Serif',
            fontStyle:'',
            fillStyle:'#fff',
            strokeStyle:null,
            strokeSize:1,
            padding:0,
            image:null,
            charMap:null,

            height:0,
            ascent:0,
            descent:0,

            setPadding:function (padding) {
                this.padding = padding;
                return this;
            },

            setFontStyle:function (style) {
                this.fontStyle = style;
                return this;
            },

            setStrokeSize:function (size) {
                this.strokeSize = size;
                return this;
            },

            setFontSize:function (fontSize) {
                this.fontSize = fontSize;
                this.fontSizeUnit = 'px';
                return this;
            },

            setFont:function (font) {
                this.font = font;
                return this;
            },

            setFillStyle:function (style) {
                this.fillStyle = style;
                return this;
            },

            setStrokeStyle:function (style) {
                this.strokeStyle = style;
                return this;
            },

            createDefault:function (padding) {
                var str = "";
                for (var i = 32; i < 128; i++) {
                    str = str + String.fromCharCode(i);
                }

                return this.create(str, padding);
            },

            create:function (chars, padding) {

                padding = padding | 0;
                this.padding = padding;

                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');

                ctx.textBaseline = 'bottom';
                ctx.font = this.fontStyle + ' ' + this.fontSize + "" + this.fontSizeUnit + " " + this.font;

                var textWidth = 0;
                var charWidth = [];
                var i;
                var x;
                var cchar;

                for (i = 0; i < chars.length; i++) {
                    var cw = Math.max(1, (ctx.measureText(chars.charAt(i)).width >> 0) + 1) + 2 * padding;
                    charWidth.push(cw);
                    textWidth += cw;
                }


                var fontMetrics = CAAT.Font.getFontMetrics(ctx.font);
                var baseline = "alphabetic", yoffset, canvasheight;

                canvasheight = fontMetrics.height;
                this.ascent = fontMetrics.ascent;
                this.descent = fontMetrics.descent;
                this.height = fontMetrics.height;
                yoffset = fontMetrics.ascent;

                canvas.width = textWidth;
                canvas.height = canvasheight;
                ctx = canvas.getContext('2d');

                //ctx.textBaseline= 'bottom';
                ctx.textBaseline = baseline;
                ctx.font = this.fontStyle + ' ' + this.fontSize + "" + this.fontSizeUnit + " " + this.font;
                ctx.fillStyle = this.fillStyle;
                ctx.strokeStyle = this.strokeStyle;

                this.charMap = {};

                x = 0;
                for (i = 0; i < chars.length; i++) {
                    cchar = chars.charAt(i);
                    ctx.fillText(cchar, x + padding, yoffset);
                    if (this.strokeStyle) {
                        ctx.beginPath();
                        ctx.lineWidth = this.strokeSize;
                        ctx.strokeText(cchar, x + padding, yoffset);
                    }
                    this.charMap[cchar] = {
                        x:x + padding,
                        width:charWidth[i] - 2 * padding,
                        height: this.height
                    };
                    x += charWidth[i];
                }

                this.image = canvas;

                return this;
            },

            setAsSpriteImage:function () {
                var cm = [];
                var _index = 0;
                for (var i in this.charMap) {
                    var _char = i;
                    var charData = this.charMap[i];

                    cm[i] = {
                        id:_index++,
                        height:this.height,
                        xoffset:0,
                        letter:_char,
                        yoffset:0,
                        width:charData.width,
                        xadvance:charData.width,
                        x:charData.x,
                        y:0
                    };
                }

                this.spriteImage = new CAAT.Foundation.SpriteImage().initializeAsGlyphDesigner(this.image, cm);
                return this;
            },

            getAscent:function () {
                return this.ascent;
            },

            getDescent:function () {
                return this.descent;
            },

            stringHeight:function () {
                return this.height;
            },

            getFontData:function () {
                return {
                    height:this.height,
                    ascent:this.ascent,
                    descent:this.descent
                };
            },

            stringWidth:function (str) {
                var i, l, w = 0, c;

                for (i = 0, l = str.length; i < l; i++) {
                    c = this.charMap[ str.charAt(i) ];
                    if (c) {
                        w += c.width;
                    } else {
                        w += UNKNOWN_CHAR_WIDTH;
                    }
                }

                return w;
            },

            drawText:function (str, ctx, x, y) {
                var i, l, charInfo, w;
                var height = this.image.height;

                for (i = 0, l = str.length; i < l; i++) {
                    charInfo = this.charMap[ str.charAt(i) ];
                    if (charInfo) {
                        w = charInfo.width;
                        if ( w>0 && charInfo.height>0 ) {
                            ctx.drawImage(
                                this.image,
                                charInfo.x, 0,
                                w, height,
                                x, y,
                                w, height);
                        }
                        x += w;
                    } else {
                        ctx.strokeStyle = '#f00';
                        ctx.strokeRect(x, y, UNKNOWN_CHAR_WIDTH, height);
                        x += UNKNOWN_CHAR_WIDTH;
                    }
                }
            },

            save:function () {
                var str = "image/png";
                var strData = this.image.toDataURL(str);
                document.location.href = strData.replace(str, "image/octet-stream");
            },

            drawSpriteText:function (director, time) {
                this.spriteImage.drawSpriteText(director, time);
            }

        }
    }

});

/**
 * See LICENSE file.
 *
 ####  #####  ##### ####    ###  #   # ###### ###### ##     ##  #####  #     #      ########    ##    #  #  #####
 #   # #   #  ###   #   #  #####  ###    ##     ##   ##  #  ##    #    #     #     #   ##   #  #####  ###   ###
 ###  #   #  ##### ####   #   #   #   ######   ##   #########  #####  ##### ##### #   ##   #  #   #  #   # #####
 -
 File:
 PackedCircle.js
 Created By:
 Mario Gonzalez
 Project    :
 None
 Abstract:
 A single packed circle.
 Contains a reference to it's div, and information pertaining to it state.
 Basic Usage:
 http://onedayitwillmake.com/CirclePackJS/
 */

CAAT.Module({

    /**
     * @name CircleManager
     * @memberOf CAAT.Module
     * @namespace
     */

    /**
     * @name PackedCircle
     * @memberOf CAAT.Module.CircleManager
     * @constructor
     */

    defines:"CAAT.Module.CircleManager.PackedCircle",
    depends:[
        "CAAT.Module.CircleManager.PackedCircle",
        "CAAT.Math.Point"
    ],
    constants:{

        /**
         * @lends CAAT.Module.CircleManager.PackedCircle
         */

        /** @const */ BOUNDS_RULE_WRAP:1, // Wrap to otherside
        /** @const */ BOUNDS_RULE_CONSTRAINT:2, // Constrain within bounds
        /** @const */ BOUNDS_RULE_DESTROY:4, // Destroy when it reaches the edge
        /** @const */ BOUNDS_RULE_IGNORE:8        // Ignore when reaching bounds
    },
    extendsWith:{

        /**
         * @lends CAAT.Module.CircleManager.PackedCircle.prototype
         */

        __init:function () {
            this.boundsRule = CAAT.Module.CircleManager.PackedCircle.BOUNDS_RULE_IGNORE;
            this.position = new CAAT.Math.Point(0, 0, 0);
            this.offset = new CAAT.Math.Point(0, 0, 0);
            this.targetPosition = new CAAT.Math.Point(0, 0, 0);
            return this;
        },

        /**
         *
         */
        id:0,

        /**
         *
         */
        delegate:null,

        /**
         *
         */
        position:null,

        /**
         *
         */
        offset:null,

        /**
         *
         */
        targetPosition:null, // Where it wants to go

        /**
         *
         */
        targetChaseSpeed:0.02,

        /**
         *
         */
        isFixed:false,

        /**
         *
         */
        boundsRule:0,

        /**
         *
         */
        collisionMask:0,

        /**
         *
         */
        collisionGroup:0,

        containsPoint:function (aPoint) {
            var distanceSquared = this.position.getDistanceSquared(aPoint);
            return distanceSquared < this.radiusSquared;
        },

        getDistanceSquaredFromPosition:function (aPosition) {
            var distanceSquared = this.position.getDistanceSquared(aPosition);
            // if it's shorter than either radius, we intersect
            return distanceSquared < this.radiusSquared;
        },

        intersects:function (aCircle) {
            var distanceSquared = this.position.getDistanceSquared(aCircle.position);
            return (distanceSquared < this.radiusSquared || distanceSquared < aCircle.radiusSquared);
        },

        /**
         * ACCESSORS
         */
        setPosition:function (aPosition) {
            this.position = aPosition;
            return this;
        },

        setDelegate:function (aDelegate) {
            this.delegate = aDelegate;
            return this;
        },

        setOffset:function (aPosition) {
            this.offset = aPosition;
            return this;
        },

        setTargetPosition:function (aTargetPosition) {
            this.targetPosition = aTargetPosition;
            return this;
        },

        setTargetChaseSpeed:function (aTargetChaseSpeed) {
            this.targetChaseSpeed = aTargetChaseSpeed;
            return this;
        },

        setIsFixed:function (value) {
            this.isFixed = value;
            return this;
        },

        setCollisionMask:function (aCollisionMask) {
            this.collisionMask = aCollisionMask;
            return this;
        },

        setCollisionGroup:function (aCollisionGroup) {
            this.collisionGroup = aCollisionGroup;
            return this;
        },

        setRadius:function (aRadius) {
            this.radius = aRadius;
            this.radiusSquared = this.radius * this.radius;
            return this;
        },

        initialize:function (overrides) {
            if (overrides) {
                for (var i in overrides) {
                    this[i] = overrides[i];
                }
            }

            return this;
        },

        dealloc:function () {
            this.position = null;
            this.offset = null;
            this.delegate = null;
            this.targetPosition = null;
        }
    }
});
/**
 *
 * See LICENSE file.
 * 
	  ####  #####  ##### ####    ###  #   # ###### ###### ##     ##  #####  #     #      ########    ##    #  #  #####
	 #   # #   #  ###   #   #  #####  ###    ##     ##   ##  #  ##    #    #     #     #   ##   #  #####  ###   ###
	 ###  #   #  ##### ####   #   #   #   ######   ##   #########  #####  ##### ##### #   ##   #  #   #  #   # #####
 -
 File:
 	PackedCircle.js
 Created By:
 	Mario Gonzalez
 Project	:
 	None
 Abstract:
 	 A single packed circle.
	 Contains a reference to it's div, and information pertaining to it state.
 Basic Usage:
	http://onedayitwillmake.com/CirclePackJS/
*/

CAAT.Module( {


    /**
     * @name PackedCircleManager
     * @memberOf CAAT.Module.CircleManager
     * @constructor
     */


    defines : "CAAT.Module.CircleManager.PackedCircleManager",
    depends : [
        "CAAT.Math.Point",
        "CAAT.Math.Rectangle"
    ],
    extendsWith : {

        /**
         * @lends CAAT.Module.CircleManager.PackedCircleManager.prototype
         * @private
         */

        __init : function() {
            this.bounds= new CAAT.Math.Rectangle();
        },

        /**
         *
         */
		allCircles:					[],

        /**
         *
         */
		numberOfCollisionPasses:	1,

        /**
         *
         */
		numberOfTargetingPasses:	0,

        /**
         *
         */
		bounds:						null,

		/**
		 * Adds a circle to the simulation
		 * @param aCircle
		 */
		addCircle: function(aCircle)
		{
			aCircle.id = this.allCircles.length;
			this.allCircles.push(aCircle);
			return this;
		},

		/**
		 * Removes a circle from the simulations
		 * @param aCircle	Circle to remove
		 */
		removeCircle: function(aCircle)
		{
			var index = 0,
				found = false,
				len = this.allCircles.length;

			if(len === 0) {
				throw "Error: (PackedCircleManager) attempting to remove circle, and allCircles.length === 0!!";
			}

			while (len--) {
				if(this.allCircles[len] === aCircle) {
					found = true;
					index = len;
					break;
				}
			}

			if(!found) {
				throw "Could not locate circle in allCircles array!";
			}

			// Remove
			this.allCircles[index].dealloc();
			this.allCircles[index] = null;

			return this;
		},

		/**
		 * Forces all circles to move to where their delegate position is
		 * Assumes all targets have a 'position' property!
		 */
		forceCirclesToMatchDelegatePositions: function()
		{
			var len = this.allCircles.length;

			// push toward target position
			for(var n = 0; n < len; n++)
			{
				var aCircle = this.allCircles[n];
				if(!aCircle || !aCircle.delegate) {
					continue;
				}

				aCircle.position.set(aCircle.delegate.x + aCircle.offset.x,
						aCircle.delegate.y + aCircle.offset.y);
			}
		},

		pushAllCirclesTowardTarget: function(aTarget)
		{
			var v = new CAAT.Math.Point(0,0,0),
				circleList = this.allCircles,
				len = circleList.length;

			// push toward target position
			for(var n = 0; n < this.numberOfTargetingPasses; n++)
			{
				for(var i = 0; i < len; i++)
				{
					var c = circleList[i];

					if(c.isFixed) continue;

					v.x = c.position.x - (c.targetPosition.x+c.offset.x);
					v.y = c.position.y - (c.targetPosition.y+c.offset.y);
					v.multiply(c.targetChaseSpeed);

					c.position.x -= v.x;
					c.position.y -= v.y;
				}
			}
		},

		/**
		 * Packs the circles towards the center of the bounds.
		 * Each circle will have it's own 'targetPosition' later on
		 */
		handleCollisions: function()
		{
			this.removeExpiredElements();

			var v = new CAAT.Math.Point(0,0, 0),
				circleList = this.allCircles,
				len = circleList.length;

			// Collide circles
			for(var n = 0; n < this.numberOfCollisionPasses; n++)
			{
				for(var i = 0; i < len; i++)
				{
					var ci = circleList[i];


					for (var j = i + 1; j< len; j++)
					{
						var cj = circleList[j];

						if( !this.circlesCanCollide(ci, cj) ) continue;   // It's us!

						var dx = cj.position.x - ci.position.x,
							dy = cj.position.y - ci.position.y;

						// The distance between the two circles radii, but we're also gonna pad it a tiny bit
						var r = (ci.radius + cj.radius) * 1.08,
							d = ci.position.getDistanceSquared(cj.position);

						/**
						 * Collision detected!
						 */
						if (d < (r * r) - 0.02 )
						{
							v.x = dx;
							v.y = dy;
							v.normalize();

							var inverseForce = (r - Math.sqrt(d)) * 0.5;
							v.multiply(inverseForce);

							// Move cj opposite of the collision as long as its not fixed
							if(!cj.isFixed)
							{
								if(ci.isFixed)
									v.multiply(2.2);	// Double inverse force to make up for the fact that the other object is fixed

								// ADD the velocity
								cj.position.translatePoint(v);
							}

							// Move ci opposite of the collision as long as its not fixed
							if(!ci.isFixed)
							{
								if(cj.isFixed)
									v.multiply(2.2);	// Double inverse force to make up for the fact that the other object is fixed

								 // SUBTRACT the velocity
								ci.position.subtract(v);
							}

							// Emit the collision event from each circle, with itself as the first parameter
//							if(this.dispatchCollisionEvents && n == this.numberOfCollisionPasses-1)
//							{
//								this.eventEmitter.emit('collision', cj, ci, v);
//							}
						}
					}
				}
			}
		},

		handleBoundaryForCircle: function(aCircle, boundsRule)
		{
//			if(aCircle.boundsRule === true) return; // Ignore if being dragged

			var xpos = aCircle.position.x;
			var ypos = aCircle.position.y;

			var radius = aCircle.radius;
			var diameter = radius*2;

			// Toggle these on and off,
			// Wrap and bounce, are opposite behaviors so pick one or the other for each axis, or bad things will happen.
			var wrapXMask = 1 << 0;
			var wrapYMask = 1 << 2;
			var constrainXMask = 1 << 3;
			var constrainYMask = 1 << 4;
			var emitEvent = 1 << 5;

			// TODO: Promote to member variable
			// Convert to bitmask - Uncomment the one you want, or concact your own :)
	//		boundsRule = wrapY; // Wrap only Y axis
	//		boundsRule = wrapX; // Wrap only X axis
	//		boundsRule = wrapXMask | wrapYMask; // Wrap both X and Y axis
			boundsRule = wrapYMask | constrainXMask;  // Wrap Y axis, but constrain horizontally

			// Wrap X
			if(boundsRule & wrapXMask && xpos-diameter > this.bounds.right) {
				aCircle.position.x = this.bounds.left + radius;
			} else if(boundsRule & wrapXMask && xpos+diameter < this.bounds.left) {
				aCircle.position.x = this.bounds.right - radius;
			}
			// Wrap Y
			if(boundsRule & wrapYMask && ypos-diameter > this.bounds.bottom) {
				aCircle.position.y = this.bounds.top - radius;
			} else if(boundsRule & wrapYMask && ypos+diameter < this.bounds.top) {
				aCircle.position.y = this.bounds.bottom + radius;
			}

			// Constrain X
			if(boundsRule & constrainXMask && xpos+radius >= this.bounds.right) {
				aCircle.position.x = aCircle.position.x = this.bounds.right-radius;
			} else if(boundsRule & constrainXMask && xpos-radius < this.bounds.left) {
				aCircle.position.x = this.bounds.left + radius;
			}

			// Constrain Y
			if(boundsRule & constrainYMask && ypos+radius > this.bounds.bottom) {
				aCircle.position.y = this.bounds.bottom - radius;
			} else if(boundsRule & constrainYMask && ypos-radius < this.bounds.top) {
				aCircle.position.y = this.bounds.top + radius;
			}
		},

		/**
		 * Given an x,y position finds circle underneath and sets it to the currently grabbed circle
		 * @param {Number} xpos		An x position
		 * @param {Number} ypos		A y position
		 * @param {Number} buffer	A radiusSquared around the point in question where something is considered to match
		 */
		getCircleAt: function(xpos, ypos, buffer)
		{
			var circleList = this.allCircles;
			var len = circleList.length;
			var grabVector = new CAAT.Math.Point(xpos, ypos, 0);

			// These are set every time a better match i found
			var closestCircle = null;
			var closestDistance = Number.MAX_VALUE;

			// Loop thru and find the closest match
			for(var i = 0; i < len; i++)
			{
				var aCircle = circleList[i];
				if(!aCircle) continue;
				var distanceSquared = aCircle.position.getDistanceSquared(grabVector);

				if(distanceSquared < closestDistance && distanceSquared < aCircle.radiusSquared + buffer)
				{
					closestDistance = distanceSquared;
					closestCircle = aCircle;
				}
			}

			return closestCircle;
		},

		circlesCanCollide: function(circleA, circleB)
		{
		    if(!circleA || !circleB || circleA===circleB) return false; 					// one is null (will be deleted next loop), or both point to same obj.
//			if(circleA.delegate == null || circleB.delegate == null) return false;					// This circle will be removed next loop, it's entity is already removed

//			if(circleA.isFixed & circleB.isFixed) return false;
//			if(circleA.delegate .clientID === circleB.delegate.clientID) return false; 				// Don't let something collide with stuff it owns

			// They dont want to collide
//			if((circleA.collisionGroup & circleB.collisionMask) == 0) return false;
//			if((circleB.collisionGroup & circleA.collisionMask) == 0) return false;

			return true;
		},
/**
 * Accessors
 */
		setBounds: function(x, y, w, h)
		{
			this.bounds.x = x;
			this.bounds.y = y;
			this.bounds.width = w;
			this.bounds.height = h;
		},

		setNumberOfCollisionPasses: function(value)
		{
			this.numberOfCollisionPasses = value;
			return this;
		},

		setNumberOfTargetingPasses: function(value)
		{
			this.numberOfTargetingPasses = value;
			return this;
		},

/**
 * Helpers
 */
		sortOnDistanceToTarget: function(circleA, circleB)
		{
			var valueA = circleA.getDistanceSquaredFromPosition(circleA.targetPosition);
			var valueB = circleB.getDistanceSquaredFromPosition(circleA.targetPosition);
			var comparisonResult = 0;

			if(valueA > valueB) comparisonResult = -1;
			else if(valueA < valueB) comparisonResult = 1;

			return comparisonResult;
		},

/**
 * Memory Management
 */
		removeExpiredElements: function()
		{
			// remove null elements
			for (var k = this.allCircles.length; k >= 0; k--) {
				if (this.allCircles[k] === null)
					this.allCircles.splice(k, 1);
			}
		},

		initialize : function(overrides)
		{
			if (overrides)
			{
				for (var i in overrides)
				{
					this[i] = overrides[i];
				}
			}

			return this;
		}
	}
});
/**
 * See LICENSE file.
 *
 * Image/Resource preloader.
 *
 *
 **/

CAAT.Module( {


    /**
     * @name Preloader
     * @memberOf CAAT.Module.Preloader
     * @constructor
     */

    defines : "CAAT.Module.Preloader.Preloader",
    extendsWith : function() {

        var descriptor= function(id, path, loader) {

            var me= this;

            this.id=    id;
            this.path=  path;
            this.image= new Image();
            this.loader= loader;

            this.image.onload= this.onload.bind(this);
            this.image.onerror= this.onerror.bind(this);

            return this;
        };

        descriptor.prototype= {
            id : null,
            path : null,
            image : null,
            loader : null,

            onload : function(e) {
                this.loader.__onload(this);
                this.image.onload= null;
                this.image.onerror= null;
            },

            onerror : function(e) {
                this.loader.__onerror(this);
            },

            load : function() {
                this.image.src= this.path;
            },

            clear : function() {
                this.loader= null;

            }
        };

        return {

            /**
             * @lends CAAT.Module.Preloader.Preloader.prototype
             */

            __init : function()   {
                this.elements= [];
                this.baseURL= "";
                return this;
            },

            currentGroup : null,

            /**
             * a list of elements to load.
             * @type {Array.<{ id, image }>}
             */
            elements:       null,

            /**
             * elements counter.
             */
            imageCounter:   0,

            /**
             * Callback finished loading.
             */
            cfinished:      null,

            /**
             * Callback element loaded.
             */
            cloaded:        null,

            /**
             * Callback error loading.
             */
            cerrored:       null,

            /**
             * loaded elements count.
             */
            loadedCount:    0,

            baseURL : null,

            addElement : function( id, path ) {
                this.elements.push( new descriptor(id,this.baseURL+path,this) );
                return this;
            },

            clear : function() {
                for( var i=0; i<this.elements.length; i++ ) {
                    this.elements[i].clear();
                }
                this.elements= null;
            },

            __onload : function( d ) {
                if ( this.cloaded ) {
                    this.cloaded(d.id);
                }

                this.loadedCount++;
                if ( this.loadedCount===this.elements.length ) {
                    if ( this.cfinished ) {
                        this.cfinished( this.elements );
                    }
                }
            },

            __onerror : function( d ) {
                if ( this.cerrored ) {
                    this.cerrored(d.id);
                }
            },

            setBaseURL : function( base ) {
                this.baseURL= base;
                return this;
            },

            load: function( onfinished, onload_one, onerror ) {

                this.cfinished= onfinished;
                this.cloaded= onload_one;
                this.cerroed= onerror;

                var i;

                for( i=0; i<this.elements.length; i++ ) {
                    this.elements[i].load();
                }

                return this;
            }
        }
    }
});
/**
 * See LICENSE file.
 *
 * Image/Resource preloader.
 *
 *
 **/

CAAT.Module( {


    /**
     * @name Preloader
     * @memberOf CAAT.Module
     * @namespace
     */

    /**
     * @name ImagePreloader
     * @memberOf CAAT.Module.Preloader
     * @constructor
     */

    defines : "CAAT.Module.Preloader.ImagePreloader",
    aliases : ["CAAT.ImagePreloader"],
    extendsWith : {

        /**
         * @lends CAAT.Module.Preloader.ImagePreloader.prototype
         */

        __init : function()   {
            this.images = [];
            return this;
        },

        /**
         * a list of elements to load.
         * @type {Array.<{ id, image }>}
         */
        images:                 null,

        /**
         * notification callback invoked for each image loaded.
         */
        notificationCallback:   null,

        /**
         * elements counter.
         */
        imageCounter:           0,

        /**
         * Start images loading asynchronous process. This method will notify every image loaded event
         * and is responsibility of the caller to count the number of loaded images to see if it fits his
         * needs.
         * 
         * @param aImages {{ id:{url}, id2:{url}, ...} an object with id/url pairs.
         * @param callback_loaded_one_image {function( imageloader {CAAT.ImagePreloader}, counter {number}, images {{ id:{string}, image: {Image}}} )}
         * function to call on every image load.
         */
        loadImages: function( aImages, callback_loaded_one_image, callback_error ) {

            if (!aImages) {
                if (callback_loaded_one_image ) {
                    callback_loaded_one_image(0,[]);
                }
            }

            var me= this, i;
            this.notificationCallback = callback_loaded_one_image;
            this.images= [];
            for( i=0; i<aImages.length; i++ ) {
                this.images.push( {id:aImages[i].id, image: new Image() } );
            }

            for( i=0; i<aImages.length; i++ ) {
                this.images[i].image.onload = function imageLoaded() {
                    me.imageCounter++;
                    me.notificationCallback(me.imageCounter, me.images);
                };

                this.images[i].image.onerror= (function(index) {
                        return function(e) {
                            if ( callback_error ) {
                                callback_error( e, index );
                            }
                        }
                    })(i);

                this.images[i].image.src= aImages[i].url;
            }

            if ( aImages.length===0 ) {
                callback_loaded_one_image(0,[]);
            }
        }

    }
});
CAAT.Module({

    defines : "CAAT.Module.Preloader.XHR",
    extendsWith : {

        /**
         *
         * @param callback function({string},{object}) a callback function. string will be "ok" or "error"
         * @param url {string} a url
         * @param asynch {bool}  load synchronous or asynchronously
         * @param method {string} GET or POST
         */
        load : function( callback, url, asynch, method ) {

            if (typeof asynch==="undefined") {
                asynch= true;
            }
            if (typeof method==="undefined") {
                method= "GET";;
            }

            var req = false;
            if(window.XMLHttpRequest && !(window.ActiveXObject)) {
                try {
                    req = new XMLHttpRequest();
                } catch(e) {
                    req = false;
                }
            } else if(window.ActiveXObject) {
                try {
                    req = new ActiveXObject("Msxml2.XMLHTTP");
                } catch(e) {
                    try {
                        req = new ActiveXObject("Microsoft.XMLHTTP");
                    } catch(e) {
                        req = false;
                    }
                }
            }

            if(req) {
                req.open(method, url, false);
                req.onreadystatechange =  function(e) {
                    if( req.status != 200 )
                        return callback("error");

                    var text= e.currentTarget ? e.currentTarget.responseText : e.target.responseText;
                    callback("ok", text);
                } ;
                req.send();
            }
        }
    }

});/**
 * See LICENSE file.
 */
CAAT.Module({

    /**
     * @name ImageUtil
     * @memberOf CAAT.Module.Image
     * @namespace
     */

    defines:"CAAT.Module.Image.ImageUtil",
    depends : [
        "CAAT.Math.Matrix"
    ],
    extendsWith:{

    },
    constants:{

        /**
         * @lends CAAT.Module.Image.ImageUtil
         */

        createAlphaSpriteSheet:function (maxAlpha, minAlpha, sheetSize, image, bg_fill_style) {

            if (maxAlpha < minAlpha) {
                var t = maxAlpha;
                maxAlpha = minAlpha;
                minAlpha = t;
            }

            var canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height * sheetSize;
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = bg_fill_style ? bg_fill_style : 'rgba(255,255,255,0)';
            ctx.fillRect(0, 0, image.width, image.height * sheetSize);

            var i;
            for (i = 0; i < sheetSize; i++) {
                ctx.globalAlpha = 1 - (maxAlpha - minAlpha) / sheetSize * (i + 1);
                ctx.drawImage(image, 0, i * image.height);
            }

            return canvas;
        },

        /**
         * Creates a rotated canvas image element.
         */
        rotate:function (image, angle) {

            angle = angle || 0;
            if (!angle) {
                return image;
            }

            var canvas = document.createElement("canvas");
            canvas.width = image.height;
            canvas.height = image.width;
            var ctx = canvas.getContext('2d');
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'rgba(0,0,0,0)';
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            var m = new CAAT.Math.Matrix();
            m.multiply(new CAAT.Math.Matrix().setTranslate(canvas.width / 2, canvas.width / 2));
            m.multiply(new CAAT.Math.Matrix().setRotation(angle * Math.PI / 180));
            m.multiply(new CAAT.Math.Matrix().setTranslate(-canvas.width / 2, -canvas.width / 2));
            m.transformRenderingContext(ctx);
            ctx.drawImage(image, 0, 0);

            return canvas;
        },

        /**
         * Remove an image's padding transparent border.
         * Transparent means that every scan pixel is alpha=0.
         */
        optimize:function (image, threshold, areas) {
            threshold >>= 0;

            var atop = true;
            var abottom = true;
            var aleft = true;
            var aright = true;
            if (typeof areas !== 'undefined') {
                if (typeof areas.top !== 'undefined') {
                    atop = areas.top;
                }
                if (typeof areas.bottom !== 'undefined') {
                    abottom = areas.bottom;
                }
                if (typeof areas.left !== 'undefined') {
                    aleft = areas.left;
                }
                if (typeof areas.right !== 'undefined') {
                    aright = areas.right;
                }
            }


            var canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            var ctx = canvas.getContext('2d');

            ctx.fillStyle = 'rgba(0,0,0,0)';
            ctx.fillRect(0, 0, image.width, image.height);
            ctx.drawImage(image, 0, 0);

            var imageData = ctx.getImageData(0, 0, image.width, image.height);
            var data = imageData.data;

            var i, j;
            var miny = 0, maxy = canvas.height - 1;
            var minx = 0, maxx = canvas.width - 1;

            var alpha = false;

            if (atop) {
                for (i = 0; i < canvas.height; i++) {
                    for (j = 0; j < canvas.width; j++) {
                        if (data[i * canvas.width * 4 + 3 + j * 4] > threshold) {
                            alpha = true;
                            break;
                        }
                    }

                    if (alpha) {
                        break;
                    }
                }
                // i contiene el indice del ultimo scan que no es transparente total.
                miny = i;
            }

            if (abottom) {
                alpha = false;
                for (i = canvas.height - 1; i >= miny; i--) {
                    for (j = 0; j < canvas.width; j++) {
                        if (data[i * canvas.width * 4 + 3 + j * 4] > threshold) {
                            alpha = true;
                            break;
                        }
                    }

                    if (alpha) {
                        break;
                    }
                }
                maxy = i;
            }

            if (aleft) {
                alpha = false;
                for (j = 0; j < canvas.width; j++) {
                    for (i = miny; i <= maxy; i++) {
                        if (data[i * canvas.width * 4 + 3 + j * 4 ] > threshold) {
                            alpha = true;
                            break;
                        }
                    }
                    if (alpha) {
                        break;
                    }
                }
                minx = j;
            }

            if (aright) {
                alpha = false;
                for (j = canvas.width - 1; j >= minx; j--) {
                    for (i = miny; i <= maxy; i++) {
                        if (data[i * canvas.width * 4 + 3 + j * 4 ] > threshold) {
                            alpha = true;
                            break;
                        }
                    }
                    if (alpha) {
                        break;
                    }
                }
                maxx = j;
            }

            if (0 === minx && 0 === miny && canvas.width - 1 === maxx && canvas.height - 1 === maxy) {
                return canvas;
            }

            var width = maxx - minx + 1;
            var height = maxy - miny + 1;
            var id2 = ctx.getImageData(minx, miny, width, height);

            canvas.width = width;
            canvas.height = height;
            ctx = canvas.getContext('2d');
            ctx.putImageData(id2, 0, 0);

            return canvas;
        },


        createThumb:function (image, w, h, best_fit) {
            w = w || 24;
            h = h || 24;
            var canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            var ctx = canvas.getContext('2d');

            if (best_fit) {
                var max = Math.max(image.width, image.height);
                var ww = image.width / max * w;
                var hh = image.height / max * h;
                ctx.drawImage(image, (w - ww) / 2, (h - hh) / 2, ww, hh);
            } else {
                ctx.drawImage(image, 0, 0, w, h);
            }

            return canvas;
        }
    }

})
/**
 * See LICENSE file.
 *
 * This file contains the definition for objects QuadTree and HashMap.
 * Quadtree offers an exact list of collisioning areas, while HashMap offers a list of potentially colliding
 * elements.
 * Specially suited for static content.
 *
 **/

CAAT.Module({

    /**
     * @name Collision
     * @memberOf CAAT.Module
     * @namespace
     */

    /**
     * @name QuadTree
     * @memberOf CAAT.Module.Collision
     * @constructor
     */

    defines:"CAAT.Module.Collision.QuadTree",
    depends:[
        "CAAT.Math.Rectangle"
    ],
    extendsClass:"CAAT.Math.Rectangle",
    extendsWith:function () {

        var QT_MAX_ELEMENTS = 1;
        var QT_MIN_WIDTH = 32;

        return {

            /**
             * @lends CAAT.Module.Collision.QuadTree.prototype
             */

            /**
             * For each quadtree level this keeps the list of overlapping elements.
             */
            bgActors:null,

            /**
             * For each quadtree, this quadData keeps another 4 quadtrees up to the  maximum recursion level.
             */
            quadData:null,

            create:function (l, t, r, b, backgroundElements, minWidth, maxElements) {

                if (typeof minWidth === 'undefined') {
                    minWidth = QT_MIN_WIDTH;
                }
                if (typeof maxElements === 'undefined') {
                    maxElements = QT_MAX_ELEMENTS;
                }

                var cx = (l + r) / 2;
                var cy = (t + b) / 2;

                this.x = l;
                this.y = t;
                this.x1 = r;
                this.y1 = b;
                this.width = r - l;
                this.height = b - t;

                this.bgActors = this.__getOverlappingActorList(backgroundElements);

                if (this.bgActors.length <= maxElements || this.width <= minWidth) {
                    return this;
                }

                this.quadData = new Array(4);
                this.quadData[0] = new CAAT.Module.Collision.QuadTree().create(l, t, cx, cy, this.bgActors);  // TL
                this.quadData[1] = new CAAT.Module.Collision.QuadTree().create(cx, t, r, cy, this.bgActors);  // TR
                this.quadData[2] = new CAAT.Module.Collision.QuadTree().create(l, cy, cx, b, this.bgActors);  // BL
                this.quadData[3] = new CAAT.Module.Collision.QuadTree().create(cx, cy, r, b, this.bgActors);

                return this;
            },

            __getOverlappingActorList:function (actorList) {
                var tmpList = [];
                for (var i = 0, l = actorList.length; i < l; i++) {
                    var actor = actorList[i];
                    if (this.intersects(actor.AABB)) {
                        tmpList.push(actor);
                    }
                }
                return tmpList;
            },

            /**
             * Call this method to thet the list of colliding elements with the parameter rectangle.
             * @param rectangle
             * @return {Array}
             */
            getOverlappingActors:function (rectangle) {
                var i, j, l;
                var overlappingActors = [];
                var qoverlappingActors;
                var actors = this.bgActors;
                var actor;

                if (this.quadData) {
                    for (i = 0; i < 4; i++) {
                        if (this.quadData[i].intersects(rectangle)) {
                            qoverlappingActors = this.quadData[i].getOverlappingActors(rectangle);
                            for (j = 0, l = qoverlappingActors.length; j < l; j++) {
                                overlappingActors.push(qoverlappingActors[j]);
                            }
                        }
                    }
                } else {
                    for (i = 0, l = actors.length; i < l; i++) {
                        actor = actors[i];
                        if (rectangle.intersects(actor.AABB)) {
                            overlappingActors.push(actor);
                        }
                    }
                }

                return overlappingActors;
            }
        }
    }
});
CAAT.Module( {


    /**
     * @name SpatialHash
     * @memberOf CAAT.Module.Collision
     * @constructor
     */


    defines : "CAAT.Module.Collision.SpatialHash",
    aliases : ["CAAT.SpatialHash"],
    depends : [
        "CAAT.Math.Rectangle"
    ],
    extendsWith : {

        /**
         * @lends CAAT.Module.Collision.SpatialHash.prototype
         */

        /**
         * A collection ob objects to test collision among them.
         */
        elements    :   null,

        /**
         * Space width
         */
        width       :   null,

        /**
         * Space height
         */
        height      :   null,

        /**
         * Rows to partition the space.
         */
        rows        :   null,

        /**
         * Columns to partition the space.
         */
        columns     :   null,

        xcache      :   null,
        ycache      :   null,
        xycache     :   null,

        rectangle   :   null,

        /**
         * Spare rectangle to hold temporary calculations.
         */
        r0          :   null,

        /**
         * Spare rectangle to hold temporary calculations.
         */
        r1          :   null,

        initialize : function( w,h, rows,columns ) {

            var i, j;

            this.elements= [];
            for( i=0; i<rows*columns; i++ ) {
                this.elements.push( [] );
            }

            this.width=     w;
            this.height=    h;

            this.rows=      rows;
            this.columns=   columns;

            this.xcache= [];
            for( i=0; i<w; i++ ) {
                this.xcache.push( (i/(w/columns))>>0 );
            }

            this.ycache= [];
            for( i=0; i<h; i++ ) {
                this.ycache.push( (i/(h/rows))>>0 );
            }

            this.xycache=[];
            for( i=0; i<this.rows; i++ ) {

                this.xycache.push( [] );
                for( j=0; j<this.columns; j++ ) {
                    this.xycache[i].push( j + i*columns  );
                }
            }

            this.rectangle= new CAAT.Math.Rectangle().setBounds( 0, 0, w, h );
            this.r0=        new CAAT.Math.Rectangle();
            this.r1=        new CAAT.Math.Rectangle();

            return this;
        },

        clearObject : function() {
            var i;

            for( i=0; i<this.rows*this.columns; i++ ) {
                this.elements[i]= [];
            }

            return this;
        },

        /**
         * Add an element of the form { id, x,y,width,height, rectangular }
         */
        addObject : function( obj  ) {
            var x= obj.x|0;
            var y= obj.y|0;
            var width= obj.width|0;
            var height= obj.height|0;

            var cells= this.__getCells( x,y,width,height );
            for( var i=0; i<cells.length; i++ ) {
                this.elements[ cells[i] ].push( obj );
            }
        },

        __getCells : function( x,y,width,height ) {

            var cells= [];
            var i;

            if ( this.rectangle.contains(x,y) ) {
                cells.push( this.xycache[ this.ycache[y] ][ this.xcache[x] ] );
            }

            /**
             * if both squares lay inside the same cell, it is not crossing a boundary.
             */
            if ( this.rectangle.contains(x+width-1,y+height-1) ) {
                var c= this.xycache[ this.ycache[y+height-1] ][ this.xcache[x+width-1] ];
                if ( c===cells[0] ) {
                    return cells;
                }
                cells.push( c );
            }

            /**
             * the other two AABB points lie inside the screen as well.
             */
            if ( this.rectangle.contains(x+width-1,y) ) {
                var c= this.xycache[ this.ycache[y] ][ this.xcache[x+width-1] ];
                if ( c===cells[0] || c===cells[1] ) {
                    return cells;
                }
                cells.push(c);
            }

            // worst case, touching 4 screen cells.
            if ( this.rectangle.contains(x+width-1,y+height-1) ) {
                var c= this.xycache[ this.ycache[y+height-1] ][ this.xcache[x] ];
                cells.push(c);
            }

            return cells;
        },

        solveCollision : function( callback ) {
            var i,j,k;

            for( i=0; i<this.elements.length; i++ ) {
                var cell= this.elements[i];

                if ( cell.length>1 ) {  // at least 2 elements could collide
                    this._solveCollisionCell( cell, callback );
                }
            }
        },

        _solveCollisionCell : function( cell, callback ) {
            var i,j;

            for( i=0; i<cell.length; i++ ) {

                var pivot= cell[i];
                this.r0.setBounds( pivot.x, pivot.y, pivot.width, pivot.height );

                for( j=i+1; j<cell.length; j++ ) {
                    var c= cell[j];

                    if ( this.r0.intersects( this.r1.setBounds( c.x, c.y, c.width, c.height ) ) ) {
                        callback( pivot, c );
                    }
                }
            }
        },

        /**
         *
         * @param x
         * @param y
         * @param w
         * @param h
         * @param oncollide function that returns boolean. if returns true, stop testing collision.
         */
        collide : function( x,y,w,h, oncollide ) {
            x|=0;
            y|=0;
            w|=0;
            h|=0;

            var cells= this.__getCells( x,y,w,h );
            var i,j,l;
            var el= this.elements;

            this.r0.setBounds( x,y,w,h );

            for( i=0; i<cells.length; i++ ) {
                var cell= cells[i];

                var elcell= el[cell];
                for( j=0, l=elcell.length; j<l; j++ ) {
                    var obj= elcell[j];

                    this.r1.setBounds( obj.x, obj.y, obj.width, obj.height );

                    // collides
                    if ( this.r0.intersects( this.r1 ) ) {
                        if ( oncollide(obj) ) {
                            return;
                        }
                    }
                }
            }
        }

    }
});
CAAT.Module({

    /**
     * @name TexturePacker
     * @memberOf CAAT.Module
     * @namespace
     */

    /**
     * @name TextureElement
     * @memberOf CAAT.Module.TexturePacker
     * @constructor
     */


    defines : "CAAT.Module.TexturePacker.TextureElement",
    extendsWith : {

        /**
         * @lends CAAT.Module.TexturePacker.TextureElement.prototype
         */

        /**
         *
         */
        inverted:   false,

        /**
         *
         */
        image:      null,

        /**
         *
         */
        u:          0,

        /**
         *
         */
        v:          0,

        /**
         *
         */
        glTexture:  null
    }
});
CAAT.Module({

    /**
     * @name TextureScan
     * @memberOf CAAT.Module.TexturePacker
     * @constructor
     */

    defines : "CAAT.Module.TexturePacker.TextureScan",
    depends : [
        "CAAT.Module.TexturePacker.TextureElement"
    ],
    extendsWith : {

        /**
         * @lends CAAT.Module.TexturePacker.TextureScan.prototype
         */

        __init : function(w) {
            this.freeChunks=[ {position:0, size:w||1024} ];
            return this;
        },

        /**
         *
         */
        freeChunks: null,

        /**
         * return an array of values where a chunk of width size fits in this scan.
         * @param width
         */
        findWhereFits : function( width ) {
            if ( this.freeChunks.length===0 ) {
                return [];
            }

            var fitsOnPosition= [];
            var i;

            for( i=0; i<this.freeChunks.length; i++ ) {
                var pos= 0;
                while( pos+width<= this.freeChunks[i].size ) {
                    fitsOnPosition.push( pos+this.freeChunks[i].position );
                    pos+= width;
                }
            }

            return fitsOnPosition;
        },
        fits : function( position, size ) {
            var i=0;

            for( i=0; i<this.freeChunks.length; i++ ) {
                var fc= this.freeChunks[i];
                if ( fc.position<=position && position+size<=fc.position+fc.size ) {
                    return true;
                }
            }

            return false;
        },
        substract : function( position, size ) {
            var i=0;

            for( i=0; i<this.freeChunks.length; i++ ) {
                var fc= this.freeChunks[i];
                if ( fc.position<=position && position+size<=fc.position+fc.size ) {
                    var lp=0;
                    var ls=0;
                    var rp=0;
                    var rs=0;

                    lp= fc.position;
                    ls= position-fc.position;

                    rp= position+size;
                    rs= fc.position+fc.size - rp;

                    this.freeChunks.splice(i,1);

                    if ( ls>0 ) {
                        this.freeChunks.splice( i++,0,{position: lp, size:ls} );
                    }
                    if ( rs>0 ) {
                        this.freeChunks.splice( i,0,{position: rp, size:rs} );
                    }

                    return true;
                }
            }

            return false;
        },
        log : function(index) {
            if ( 0===this.freeChunks.length ) {
                CAAT.log('index '+index+' empty');
            } else {
                var str='index '+index;
                for( var i=0; i<this.freeChunks.length; i++ ) {
                    var fc= this.freeChunks[i];
                    str+='['+fc.position+","+fc.size+"]";
                }
                CAAT.log(str);
            }
        }
    }
});
CAAT.Module({

    /**
     * @name TextureScanMap
     * @memberOf CAAT.Module.TexturePacker
     * @constructor
     */

    defines : "CAAT.Module.TexturePacker.TextureScanMap",
    depends : [
        "CAAT.Module.TexturePacker.TextureScan"
    ],
    extendsWith : {

        /**
         * @lends CAAT.Module.TexturePacker.TextureScanMap.prototype
         */

        __init : function(w,h) {
            this.scanMapHeight= h;
            this.scanMapWidth= w;

            this.scanMap= [];
            for( var i=0; i<this.scanMapHeight; i++ ) {
                this.scanMap.push( new CAAT.Module.TexturePacker.TextureScan(this.scanMapWidth) );
            }

            return this;
        },

        /**
         *
         */
        scanMap:        null,

        /**
         *
         */
        scanMapWidth:   0,

        /**
         *
         */
        scanMapHeight:  0,

        /**
         * Always try to fit a chunk of size width*height pixels from left-top.
         * @param width
         * @param height
         */
        whereFitsChunk : function( width, height ) {

            // trivial rejection:
            if ( width>this.width||height>this.height) {
                return null;
            }

            // find first fitting point
            var i,j,initialPosition= 0;

            while( initialPosition<=this.scanMapHeight-height) {

                // para buscar sitio se buscara un sitio hasta el tamano de alto del trozo.
                // mas abajo no va a caber.

                // fitHorizontalPosition es un array con todas las posiciones de este scan donde
                // cabe un chunk de tamano width.
                var fitHorizontalPositions= null;
                var foundPositionOnScan=    false;

                for( ; initialPosition<=this.scanMapHeight-height; initialPosition++ ) {
                    fitHorizontalPositions= this.scanMap[ initialPosition ].findWhereFits( width );

                    // si no es nulo el array de resultados, quiere decir que en alguno de los puntos
                    // nos cabe un trozo de tamano width.
                    if ( null!==fitHorizontalPositions && fitHorizontalPositions.length>0 ) {
                        foundPositionOnScan= true;
                        break;
                    }
                }

                if ( foundPositionOnScan ) {
                    // j es el scan donde cabe un trozo de tamano width.
                    // comprobamos desde este scan que en todos los scan verticales cabe el trozo.
                    // se comprueba que cabe en alguno de los tamanos que la rutina de busqueda horizontal
                    // nos ha devuelto antes.

                    var minInitialPosition=Number.MAX_VALUE;
                    for( j=0; j<fitHorizontalPositions.length; j++ ) {
                        var fits= true;
                        for( i=initialPosition; i<initialPosition+height; i++ ) {
                            // hay un trozo que no cabe
                            if ( !this.scanMap[i].fits( fitHorizontalPositions[j], width ) ) {
                                fits= false;
                                break;
                            }
                        }

                        // se ha encontrado un trozo donde la imagen entra.
                        // d.p.m. incluirla en posicion, y seguir con otra.
                        if ( fits ) {
                            return { x: fitHorizontalPositions[j], y: initialPosition };
                        } 
                    }

                    initialPosition++;
                } else {
                    // no hay sitio en ningun scan.
                    return null;
                }
            }

            // no se ha podido encontrar un area en la textura para un trozo de tamano width*height
            return null;
        },
        substract : function( x,y, width, height ) {
            for( var i=0; i<height; i++ ) {
                if ( !this.scanMap[i+y].substract(x,width) ) {
                    CAAT.log('Error: removing chunk ',width,height,' at ',x,y);
                }
            }
        },
        log : function() {
            for( var i=0; i<this.scanMapHeight; i++ ) {
                this.scanMap[i].log(i);
            }
        }
    }
});
CAAT.Module( {

    /**
     * @name TexturePage
     * @memberOf CAAT.Module.TexturePacker
     * @constructor
     */


    defines : "CAAT.Module.TexturePacker.TexturePage",
    depends : [
        "CAAT.Module.TexturePacker.TextureScanMap"
    ],
    extendsWith : {

        /**
         * @lends CAAT.Module.TexturePacker.TexturePage.prototype
         */

        __init : function(w,h) {
            this.width=         w || 1024;
            this.height=        h || 1024;
            this.images=        [];

            return this;
        },

        /**
         *
         */
        width:                  1024,

        /**
         *
         */
        height:                 1024,

        /**
         *
         */
        gl:                     null,

        /**
         *
         */
        texture:                null,

        /**
         *
         */
        allowImagesInvertion:   false,

        /**
         *
         */
        padding:                4,

        /**
         *
         */
        scan:                   null,

        /**
         *
         */
        images:                 null,

        /**
         *
         */
        criteria:               'area',

        initialize : function(gl) {
            this.gl= gl;

            // Fix firefox.
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

            this.texture = gl.createTexture();

            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.enable( gl.BLEND );
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

            var uarr= new Uint8Array(this.width*this.height*4);
            for (var jj = 0; jj < 4*this.width*this.height; ) {
                uarr[jj++]=0;
                uarr[jj++]=0;
                uarr[jj++]=0;
                uarr[jj++]=0;
            }
            gl.texImage2D(
                    gl.TEXTURE_2D,
                    0,
                    gl.RGBA,
                    this.width,
                    this.height,
                    0,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    uarr);

            gl.enable( gl.BLEND );

            for( var i=0; i<this.images.length; i++ ) {

                var img= this.images[i];
                if ( img.inverted ) {
                    img= CAAT.Module.Image.ImageUtil.rotate( img, -90 );
                }

                gl.texSubImage2D(
                        gl.TEXTURE_2D,
                        0,
                        this.images[i].__tx, this.images[i].__ty,
                        gl.RGBA,
                        gl.UNSIGNED_BYTE,
                        img );
            }

        },
        create: function(imagesCache) {

            var images= [];
            for( var i=0; i<imagesCache.length; i++ ) {
                var img= imagesCache[i].image;
                if ( !img.__texturePage ) {
                    images.push( img );
                }
            }

            this.createFromImages(images);
        },
        clear : function() {
            this.createFromImages([]);
        },
        update : function(invert,padding,width,height) {
            this.allowImagesInvertion= invert;
            this.padding= padding;

            if ( width<100 ) {
                width= 100;
            }
            if ( height<100 ) {
                height= 100;
            }

            this.width=  width;
            this.height= height;
            
            this.createFromImages(this.images);
        },
        createFromImages : function( images ) {

            var i;

            this.scan=   new CAAT.Module.TexturePacker.TextureScanMap( this.width, this.height );
            this.images= [];

            if ( this.allowImagesInvertion ) {
                for( i=0; i<images.length; i++ ) {
                    images[i].inverted= this.allowImagesInvertion && images[i].height<images[i].width;
                }
            }

            var me= this;

            images.sort( function(a,b) {

                var aarea= a.width*a.height;
                var barea= b.width*b.height;

                if ( me.criteria==='width' ) {
                    return a.width<b.width ? 1 : a.width>b.width ? -1 : 0;
                } else if ( me.criteria==='height' ) {
                    return a.height<b.height ? 1 : a.height>b.height ? -1 : 0;
                }
                return aarea<barea ? 1 : aarea>barea ? -1 : 0;
            });

            for( i=0; i<images.length; i++ ) {
                var img=  images[i];
                this.packImage(img);
            }
        },
        addImage : function( image, invert, padding ) {
            this.allowImagesInvertion= invert;
            this.padding= padding;
            this.images.push(image);
            this.createFromImages(Array.prototype.slice.call(this.images));
        },
        endCreation : function() {
            var gl= this.gl;
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
        },
        deletePage : function() {
            for( var i=0; i<this.images.length; i++ ) {
                delete this.images[i].__texturePage;
                delete this.images[i].__u;
                delete this.images[i].__v;
            }

            this.gl.deleteTexture( this.texture );
        },
        toCanvas : function(canvass, outline) {

            canvass= canvass || document.createElement('canvas');
            canvass.width= this.width;
            canvass.height= this.height;
            var ctxx= canvass.getContext('2d');
            ctxx.fillStyle= 'rgba(0,0,0,0)';
            ctxx.fillRect(0,0,this.width,this.height);

            for( var i=0; i<this.images.length; i++ ) {
                ctxx.drawImage(
                        !this.images[i].inverted ?
                                this.images[i] :
                                CAAT.Modules.Image.ImageUtil.rotate( this.images[i], 90 ),
                        this.images[i].__tx,
                        this.images[i].__ty );
                if ( outline ) {
                    ctxx.strokeStyle= 'red';
                    ctxx.strokeRect(
                            this.images[i].__tx,
                            this.images[i].__ty,
                            this.images[i].__w,
                            this.images[i].__h );
                }
            }


            if (outline) {
                ctxx.strokeStyle= 'red';
                ctxx.strokeRect(0,0,this.width,this.height);
            }

            return canvass;
        },
        packImage : function(img) {
            var newWidth, newHeight;
            if ( img.inverted ) {
                newWidth= img.height;
                newHeight= img.width;
            } else {
                newWidth= img.width;
                newHeight= img.height;
            }

            var w= newWidth;
            var h= newHeight;

            var mod;

            // dejamos un poco de espacio para que las texturas no se pisen.
            // coordenadas normalizadas 0..1 dan problemas cuando las texturas no estan
            // alineadas a posicion mod 4,8...
            if ( w && this.padding ) {
                mod= this.padding;
                if ( w+mod<=this.width ) {
                    w+=mod;
                }
            }
            if ( h && this.padding ) {
                mod= this.padding;
                if ( h+mod<=this.height ) {
                    h+=mod;
                }
            }
            
            var where=  this.scan.whereFitsChunk( w, h );
            if ( null!==where ) {
                this.images.push( img );

                img.__tx= where.x;
                img.__ty= where.y;
                img.__u=  where.x / this.width;
                img.__v=  where.y / this.height;
                img.__u1= (where.x+newWidth) / this.width;
                img.__v1= (where.y+newHeight) / this.height;
                img.__texturePage= this;
                img.__w= newWidth;
                img.__h= newHeight;

                this.scan.substract(where.x,where.y,w,h);
            } else {
                CAAT.log('Imagen ',img.src,' de tamano ',img.width,img.height,' no cabe.');
            }
        },
        changeHeuristic : function(criteria) {
            this.criteria= criteria;
        }
    }
});
/**
 * See LICENSE file.
 */

CAAT.Module({

    /**
     * @name TexturePageManager
     * @memberOf CAAT.Module.TexturePacker
     * @constructor
     */

    defines : "CAAT.Module.TexturePacker.TexturePageManager",
    depends : [
        "CAAT.Module.TexturePacker.TexturePage"
    ],
    extendsWith : {

        /**
         * @lends CAAT.Module.TexturePacker.TexturePageManager.prototype
         */

        __init : function() {
            this.pages= [];
            return this;
        },

        /**
         *
         */
        pages:  null,

        createPages:    function(gl,width,height,imagesCache) {

            var end= false;
            while( !end ) {
                var page= new CAAT.Module.TexturePacker.TexturePage(width,height);
                page.create(imagesCache);
                page.initialize(gl);
                page.endCreation();
                this.pages.push(page);

                end= true;
                for( var i=0; i<imagesCache.length; i++ ) {
                    // imagen sin asociacion de textura
                    if ( !imagesCache[i].image.__texturePage ) {
                        // cabe en la pagina ?? continua con otras paginas.
                        if ( imagesCache[i].image.width<=width && imagesCache[i].image.height<=height ) {
                            end= false;
                        }
                        break;
                    }
                }
            }
        },
        deletePages : function() {
            for( var i=0; i<this.pages.length; i++ ) {
                this.pages[i].deletePage();
            }
            this.pages= null;
        }
    }

});
CAAT.Module({
    defines:"CAAT.Module.LayoutUtils.RowLayout",
    constants:{
        Row:function (dst, what_to_layout_array, constraint_object) {

            var width = dst.width;
            var x = 0, y = 0, i = 0, l = 0;
            var actor_max_h = -Number.MAX_VALUE, actor_max_w = Number.MAX_VALUE;

            // compute max/min actor list size.
            for (i = what_to_layout_array.length - 1; i; i -= 1) {
                if (actor_max_w < what_to_layout_array[i].width) {
                    actor_max_w = what_to_layout_array[i].width;
                }
                if (actor_max_h < what_to_layout_array[i].height) {
                    actor_max_h = what_to_layout_array[i].height;
                }
            }

            if (constraint_object.padding_left) {
                x = constraint_object.padding_left;
                width -= x;
            }
            if (constraint_object.padding_right) {
                width -= constraint_object.padding_right;
            }

            if (constraint_object.top) {
                var top = parseInt(constraint_object.top, 10);
                if (!isNaN(top)) {
                    y = top;
                } else {
                    // not number
                    switch (constraint_object.top) {
                        case 'center':
                            y = (dst.height - actor_max_h) / 2;
                            break;
                        case 'top':
                            y = 0;
                            break;
                        case 'bottom':
                            y = dst.height - actor_max_h;
                            break;
                        default:
                            y = 0;
                    }
                }
            }

            // space for each actor
            var actor_area = width / what_to_layout_array.length;

            for (i = 0, l = what_to_layout_array.length; i < l; i++) {
                what_to_layout_array[i].setLocation(
                    x + i * actor_area + (actor_area - what_to_layout_array[i].width) / 2,
                    y);
            }

        }
    }
});CAAT.Module({
    defines : "CAAT.Module.Initialization.Template",
    depends : [
        "CAAT.Foundation.Director",
        "CAAT.Module.Preloader.ImagePreloader"
    ],
    constants: {
        init : function( width, height, runHere, imagesURL, onEndLoading )   {

            var canvascontainer= document.getElementById(runHere);
            var director;

            if ( CAAT.__CSS__ ) {   // css renderer
                if ( canvascontainer ) {
                    if ( false===canvascontainer instanceof HTMLDivElement ) {
                        canvascontainer= null;
                    }
                }

                if ( canvascontainer===null ) {
                    canvascontainer= document.createElement('div'); // create a new DIV
                    document.body.appendChild(canvascontainer);
                }

                director= new CAAT.Foundation.Director().
                    initialize(
                        width||800,
                        height||600,
                        canvascontainer);

            } else {

                if ( canvascontainer ) {
                    if ( canvascontainer instanceof HTMLDivElement ) {
                        var ncanvascontainer= document.createElement("canvas");
                        canvascontainer.appendChild(ncanvascontainer);
                        canvascontainer= ncanvascontainer;
                    } else if ( false==canvascontainer instanceof HTMLCanvasElement ) {
                        var ncanvascontainer= document.createElement("canvas");
                        document.body.appendChild(ncanvascontainer);
                        canvascontainer= ncanvascontainer;
                    }
                } else {
                    canvascontainer= document.createElement('canvas');
                    document.body.appendChild(canvascontainer);
                }

                director= new CAAT.Foundation.Director().
                        initialize(
                            width||800,
                            height||600,
                            canvascontainer);
            }

            /**
             * Load splash images. It is supossed the splash has some images.
             */
            new CAAT.Module.Preloader.ImagePreloader().loadImages(
                imagesURL,
                function on_load( counter, images ) {

                    if ( counter===images.length ) {

                        director.emptyScenes();
                        director.setImagesCache(images);

                        onEndLoading(director);

                        /**
                         * Change this sentence's parameters to play with different entering-scene
                         * curtains.
                         * just perform a director.setScene(0) to play first director's scene.
                         */
                        director.easeIn(
                                0,
                                CAAT.Foundation.Scene.EASE_SCALE,
                                2000,
                                false,
                                CAAT.Foundation.Actor.ANCHOR_CENTER,
                                new CAAT.Behavior.Interpolator().createElasticOutInterpolator(2.5, .4) );

                        CAAT.loop(60);

                    }
                }
            );

        }
    }
});
CAAT.Module({
    defines : "CAAT.Module.Initialization.TemplateWithSplash",
    depends : [
        "CAAT.Foundation.Director",
        "CAAT.Module.Preloader.ImagePreloader"
    ],
    constants: {

        init : function( width, height, runHere, minTime, imagesURL, onEndSplash, splash_path, spinner_path )   {

            function createSplashScene(director, showTime, sceneCreationCallback) {

                var spinnerImg= director.getImage('spinner');
                var splashImg=  director.getImage('splash');
                var scene=      director.createScene();
                var TIME=       showTime;
                var time=       new Date().getTime();

                if ( splashImg ) {
                    scene.addChild(
                            new CAAT.Foundation.Actor().
                                setBackgroundImage(splashImg, false).
                                setBounds(0,0,director.width,director.height).
                                setImageTransformation( CAAT.Foundation.SpriteImage.TR_FIXED_TO_SIZE )
                            );
                }

                if ( spinnerImg ) {
                    scene.addChild(
                            new CAAT.Foundation.Actor().
                                setBackgroundImage(spinnerImg).
                                centerAt( scene.width/2, scene.height/2).
                                addBehavior(
                                    new CAAT.Behavior.RotateBehavior().
                                            setValues(0,2*Math.PI).
                                            setFrameTime(0,1000).
                                            setCycle(true)
                                    )
                            );
                }

                scene.loadedImage = function(count, images) {

                    if ( !images || count===images.length ) {

                        var difftime= new Date().getTime()-time;
                        if ( difftime<TIME ){
                            difftime= Math.abs(TIME-difftime);
                            if ( difftime>TIME ) {
                                difftime= TIME;
                            }

                            setTimeout(
                                    function() {
                                        endSplash(director, images, sceneCreationCallback);
                                    },
                                    difftime );

                        } else {
                            endSplash(director, images, sceneCreationCallback);
                        }

                    }
                };

                return scene;
            }
            /**
             * Finish splash process by either timeout or resources allocation end.
             */
            function endSplash(director, images, onEndSplashCallback) {

                director.emptyScenes();
                director.setImagesCache(images);
                director.setClear( true );

                onEndSplashCallback(director);

                /**
                 * Change this sentence's parameters to play with different entering-scene
                 * curtains.
                 * just perform a director.setScene(0) to play first director's scene.
                 */

                director.setClear( CAAT.Foundation.Director.CLEAR_ALL );
                director.easeIn(
                        0,
                        CAAT.Foundation.Scene.EASE_SCALE,
                        2000,
                        false,
                        CAAT.Foundation.Actor.ANCHOR_CENTER,
                        new CAAT.Behavior.Interpolator().createElasticOutInterpolator(2.5, .4) );

            }

            var canvascontainer= document.getElementById(runHere);
            var director;

            if ( CAAT.__CSS__ ) {   // css renderer
                if ( canvascontainer ) {
                    if ( false===canvascontainer instanceof HTMLDivElement ) {
                        canvascontainer= null;
                    }
                }

                if ( canvascontainer===null ) {
                    canvascontainer= document.createElement('div'); // create a new DIV
                    document.body.appendChild(canvascontainer);
                }

                director= new CAAT.Foundation.Director().
                    initialize(
                        width||800,
                        height||600,
                        canvascontainer);

            } else {

                if ( canvascontainer ) {
                    if ( canvascontainer instanceof HTMLDivElement ) {
                        var ncanvascontainer= document.createElement("canvas");
                        canvascontainer.appendChild(ncanvascontainer);
                        canvascontainer= ncanvascontainer;
                    } else if ( false==canvascontainer instanceof HTMLCanvasElement ) {
                        var ncanvascontainer= document.createElement("canvas");
                        document.body.appendChild(ncanvascontainer);
                        canvascontainer= ncanvascontainer;
                    }
                } else {
                    canvascontainer= document.createElement('canvas');
                    document.body.appendChild(canvascontainer);
                }

                director= new CAAT.Foundation.Director().
                        initialize(
                            width||800,
                            height||600,
                            canvascontainer);
            }


            /**
             * Load splash images. It is supossed the splash has some images.
             */
            var imgs= [];
            if ( splash_path ) {
                imgs.push( {id:'splash',   url: splash_path } );
            }
            if ( spinner_path ) {
                imgs.push( {id:'spinner',  url: spinner_path } );
            }

            director.setClear( CAAT.Foundation.Director.CLEAR_DIRTY_RECTS );

            new CAAT.Module.Preloader.ImagePreloader().loadImages(
                imgs,
                function on_load( counter, images ) {

                    if ( counter===images.length ) {

                        director.setImagesCache(images);
                        var splashScene= createSplashScene(director, minTime || 5000, onEndSplash);
                        CAAT.loop(60);

                        if ( imagesURL && imagesURL.length>0 ) {
                            /**
                             * Load resources for non splash screen
                             */
                            new CAAT.Module.Preloader.ImagePreloader().loadImages(
                                    imagesURL,
                                    splashScene.loadedImage
                            );
                        } else {
                            splashScene.loadedImage(0,null);
                        }
                    }
                }
            );
        }

    }
});/**
 * See LICENSE file.
 *
 * This object manages CSS3 transitions reflecting applying behaviors.
 *
 **/

(function() {

    /**
     * @name CSS
     * @memberOf CAAT
     * @namespace
     */

    CAAT.CSS= {};

    /**
     * @lends CAAT.CSS
     */


    /**
     * Guess a browser custom prefix.
     * @type {*}
     */
    CAAT.CSS.PREFIX= (function() {

        var prefix = "";
        var prefixes = ['WebKit', 'Moz', 'O'];
        var keyframes= "";

        // guess this browser vendor prefix.
        for (var i = 0; i < prefixes.length; i++) {
            if (window[prefixes[i] + 'CSSKeyframeRule']) {
                prefix = prefixes[i].toLowerCase();
                break;
            }
        }

        CAAT.CSS.PROP_ANIMATION= '-'+prefix+'-animation';

        return prefix;
    })();

    /**
     * Apply a given @key-frames animation to a DOM element.
     * @param domElement {DOMElement}
     * @param name {string} animation name
     * @param duration_millis {number}
     * @param delay_millis {number}
     * @param forever {boolean}
     */
    CAAT.CSS.applyKeyframe= function( domElement, name, duration_millis, delay_millis, forever ) {
        domElement.style[CAAT.CSS.PROP_ANIMATION]= name+' '+(duration_millis/1000)+'s '+(delay_millis/1000)+'s linear both '+(forever ? 'infinite' : '') ;
    };

    /**
     * Remove a @key-frames animation from the stylesheet.
     * @param name
     */
    CAAT.CSS.unregisterKeyframes= function( name ) {
        var index= CAAT.CSS.getCSSKeyframesIndex(name);
        if ( null!==index ) {
            document.styleSheets[ index.sheetIndex ].deleteRule( index.index );
        }
    };

    /**
     *
     * @param kfDescriptor {object}
     *      {
     *          name{string},
     *          behavior{CAAT.Behavior},
     *          size{!number},
     *          overwrite{boolean}
     *      }
     *  }
     */
    CAAT.CSS.registerKeyframes= function( kfDescriptor ) {

        var name=       kfDescriptor.name;
        var behavior=   kfDescriptor.behavior;
        var size=       kfDescriptor.size;
        var overwrite=  kfDescriptor.overwrite;

        if ( typeof name==='undefined' || typeof behavior==='undefined' ) {
            throw 'Keyframes must be defined by a name and a CAAT.Behavior instance.';
        }

        if ( typeof size==='undefined' ) {
            size= 100;
        }
        if ( typeof overwrite==='undefined' ) {
            overwrite= false;
        }

        // find if keyframes has already a name set.
        var cssRulesIndex= CAAT.CSS.getCSSKeyframesIndex(name);
        if (null!==cssRulesIndex && !overwrite) {
            return;
        }

        var keyframesRule= behavior.calculateKeyFramesData(CAAT.CSS.PREFIX, name, size, kfDescriptor.anchorX, kfDescriptor.anchorY );

        if (document.styleSheets) {
            if ( !document.styleSheets.length) {
                var s = document.createElement('style');
                s.type="text/css";

                document.getElementsByTagName('head')[ 0 ].appendChild(s);
            }

            if ( null!==cssRulesIndex ) {
                document.styleSheets[ cssRulesIndex.sheetIndex ].deleteRule( cssRulesIndex.index );
            }

            var index= cssRulesIndex ? cssRulesIndex.sheetIndex : 0;
            document.styleSheets[ index ].insertRule( keyframesRule, 0 );
        }

        return keyframesRule;
    };

    CAAT.CSS.getCSSKeyframesIndex= function(name) {
        var ss = document.styleSheets;
        for (var i = ss.length - 1; i >= 0; i--) {
            try {
                var s = ss[i],
                    rs = s.cssRules ? s.cssRules :
                         s.rules ? s.rules :
                         [];

                for (var j = rs.length - 1; j >= 0; j--) {
                    if ( ( rs[j].type === window.CSSRule.WEBKIT_KEYFRAMES_RULE ||
                           rs[j].type === window.CSSRule.MOZ_KEYFRAMES_RULE ) && rs[j].name === name) {

                        return {
                            sheetIndex : i,
                            index: j
                        };
                    }
                }
            } catch(e) {
            }
        }

        return null;
    };

    CAAT.CSS.getCSSKeyframes= function(name) {

        var ss = document.styleSheets;
        for (var i = ss.length - 1; i >= 0; i--) {
            try {
                var s = ss[i],
                    rs = s.cssRules ? s.cssRules :
                         s.rules ? s.rules :
                         [];

                for (var j = rs.length - 1; j >= 0; j--) {
                    if ( ( rs[j].type === window.CSSRule.WEBKIT_KEYFRAMES_RULE ||
                           rs[j].type === window.CSSRule.MOZ_KEYFRAMES_RULE ) && rs[j].name === name) {

                        return rs[j];
                    }
                }
            }
            catch(e) {
            }
        }
        return null;
    };



})();
/**
 * See LICENSE file.
 *
 * These classes encapsulate different kinds of paths.
 * LinearPath, defines an straight line path, just 2 points.
 * CurvePath, defines a path based on a Curve. Curves can be bezier quadric/cubic and catmull-rom.
 * Path, is a general purpose class, which composes a path of different path segments (Linear or Curve paths).
 *
 * A path, has an interpolator which stablish the way the path is traversed (accelerating, by
 * easing functions, etc.). Normally, interpolators will be defined by CAAT.Behavior.Interpolator instances, but
 * general Paths could be used as well.
 *
 **/


CAAT.Module({

    /**
     * @name PathUtil
     * @memberOf CAAT
     * @namespace
     */

    /**
     * @name PathSegment
     * @memberOf CAAT.PathUtil
     * @constructor
     */

    defines:"CAAT.PathUtil.PathSegment",
    depends:[
        "CAAT.Math.Rectangle",
        "CAAT.Math.Point",
        "CAAT.Math.Matrix",
        "CAAT.Math.Curve"
    ],
    extendsWith:function () {
        return {

            /**
             * @lends CAAT.PathUtil.PathSegment.prototype
             */


            __init:function () {
                this.bbox = new CAAT.Math.Rectangle();
                return this;
            },

            /**
             * Color to draw the segment.
             */
            color:'#000',

            /**
             * Segment length.
             */
            length:0,

            /**
             * Segment bounding box.
             */
            bbox:null,

            /**
             * Path this segment belongs to.
             */
            parent:null,

            /**
             * Set a PathSegment's parent
             * @param parent
             */
            setParent:function (parent) {
                this.parent = parent;
                return this;
            },
            setColor:function (color) {
                if (color) {
                    this.color = color;
                }
                return this;
            },
            /**
             * Get path's last coordinate.
             * @return {CAAT.Point}
             */
            endCurvePosition:function () {
            },

            /**
             * Get path's starting coordinate.
             * @return {CAAT.Point}
             */
            startCurvePosition:function () {
            },

            /**
             * Set this path segment's points information.
             * @param points {Array<CAAT.Point>}
             */
            setPoints:function (points) {
            },

            /**
             * Set a point from this path segment.
             * @param point {CAAT.Point}
             * @param index {integer} a point index.
             */
            setPoint:function (point, index) {
            },

            /**
             * Get a coordinate on path.
             * The parameter time is normalized, that is, its values range from zero to one.
             * zero will mean <code>startCurvePosition</code> and one will be <code>endCurvePosition</code>. Other values
             * will be a position on the path relative to the path length. if the value is greater that 1, if will be set
             * to modulus 1.
             * @param time a float with a value between zero and 1 inclusive both.
             *
             * @return {CAAT.Point}
             */
            getPosition:function (time) {
            },

            /**
             * Gets Path length.
             * @return {number}
             */
            getLength:function () {
                return this.length;
            },

            /**
             * Gets the path bounding box (or the rectangle that contains the whole path).
             * @param rectangle a CAAT.Rectangle instance with the bounding box.
             * @return {CAAT.Rectangle}
             */
            getBoundingBox:function () {
                return this.bbox;
            },

            /**
             * Gets the number of control points needed to create the path.
             * Each PathSegment type can have different control points.
             * @return {number} an integer with the number of control points.
             */
            numControlPoints:function () {
            },

            /**
             * Gets CAAT.Point instance with the 2d position of a control point.
             * @param index an integer indicating the desired control point coordinate.
             * @return {CAAT.Point}
             */
            getControlPoint:function (index) {
            },

            /**
             * Instruments the path has finished building, and that no more segments will be added to it.
             * You could later add more PathSegments and <code>endPath</code> must be called again.
             */
            endPath:function () {
            },

            /**
             * Gets a polyline describing the path contour. The contour will be defined by as mush as iSize segments.
             * @param iSize an integer indicating the number of segments of the contour polyline.
             *
             * @return {[CAAT.Point]}
             */
            getContour:function (iSize) {
            },

            /**
             * Recalculate internal path structures.
             */
            updatePath:function (point) {
            },

            /**
             * Draw this path using RenderingContext2D drawing primitives.
             * The intention is to set a path or pathsegment as a clipping region.
             *
             * @param ctx {RenderingContext2D}
             */
            applyAsPath:function (director) {
            },

            /**
             * Transform this path with the given affinetransform matrix.
             * @param matrix
             */
            transform:function (matrix) {
            },

            drawHandle:function (ctx, x, y) {

                ctx.beginPath();
                ctx.arc(
                    x,
                    y,
                    CAAT.Math.Curve.prototype.HANDLE_SIZE / 2,
                    0,
                    2 * Math.PI,
                    false);
                ctx.fill();
            }
        }
    }

});
CAAT.Module({

    /**
     * @name ArcPath
     * @memberOf CAAT.PathUtil
     * @extends CAAT.PathUtil.PathSegment
     * @constructor
     */

    defines:"CAAT.PathUtil.ArcPath",
    depends:[
        "CAAT.PathUtil.PathSegment",
        "CAAT.Math.Point",
        "CAAT.Math.Rectangle"
    ],
    aliases:["CAAT.ArcPath"],
    extendsClass:"CAAT.PathUtil.PathSegment",
    extendsWith:function () {

        return {

            /**
             * @lends CAAT.PathUtil.ArcPath.prototype
             */

            __init:function () {
                this.__super();

                this.points = [];
                this.points.push(new CAAT.Math.Point());
                this.points.push(new CAAT.Math.Point());

                this.newPosition = new CAAT.Math.Point();

                return this;
            },

            /**
             * A collection of CAAT.Math.Point objects which defines the arc (center, start, end)
             */
            points:null,

            /**
             * Defined clockwise or counterclockwise ?
             */
            cw:true,

            /**
             * spare point for calculations
             */
            newPosition:null,

            /**
             * Arc radius.
             */
            radius:0,

            /**
             * Arc start angle.
             */
            startAngle:0,

            /**
             * Arc end angle.
             */
            angle:2 * Math.PI,

            /**
             * is a relative or absolute arc ?
             */
            arcTo:false,

            setRadius:function (r) {
                this.radius = r;
                return this;
            },

            isArcTo:function () {
                return this.arcTo;
            },

            setArcTo:function (b) {
                this.arcTo = b;
                return this;
            },

            initialize:function (x, y, r, angle) {
                this.setInitialPosition(x, y);
                this.setFinalPosition(x + r, y);
                this.angle = angle || 2 * Math.PI;
                return this;
            },

            applyAsPath:function (director) {
                var ctx = director.ctx;
                if (!this.arcTo) {
                    ctx.arc(this.points[0].x, this.points[0].y, this.radius, this.startAngle, this.angle + this.startAngle, this.cw);
                } else {
                    ctx.arcTo(this.points[0].x, this.points[0].y, this.points[1].x, this.points[1].y, this.radius);
                }
                return this;
            },
            setPoint:function (point, index) {
                if (index >= 0 && index < this.points.length) {
                    this.points[index] = point;
                }
            },
            /**
             * An array of {CAAT.Point} composed of two points.
             * @param points {Array<CAAT.Point>}
             */
            setPoints:function (points) {
                this.points = [];
                this.points[0] = points[0];
                this.points[1] = points[1];
                this.updatePath();

                return this;
            },
            setClockWise:function (cw) {
                this.cw = cw !== undefined ? cw : true;
                return this;
            },
            isClockWise:function () {
                return this.cw;
            },
            /**
             * Set this path segment's starting position.
             * This method should not be called again after setFinalPosition has been called.
             * @param x {number}
             * @param y {number}
             */
            setInitialPosition:function (x, y) {
                for (var i = 0, l = this.points.length; i < l; i++) {
                    this.points[0].x = x;
                    this.points[0].y = y;
                }

                return this;
            },
            /**
             * Set a rectangle from points[0] to (finalX, finalY)
             * @param finalX {number}
             * @param finalY {number}
             */
            setFinalPosition:function (finalX, finalY) {
                this.points[1].x = finalX;
                this.points[1].y = finalY;

                this.updatePath(this.points[1]);
                return this;
            },
            /**
             * An arc starts and ends in the same point.
             */
            endCurvePosition:function () {
                return this.points[0];
            },
            /**
             * @inheritsDoc
             */
            startCurvePosition:function () {
                return this.points[0];
            },
            /**
             * @inheritsDoc
             */
            getPosition:function (time) {

                if (time > 1 || time < 0) {
                    time %= 1;
                }
                if (time < 0) {
                    time = 1 + time;
                }

                if (-1 === this.length) {
                    this.newPosition.set(this.points[0].x, this.points[0].y);
                } else {

                    var angle = this.angle * time * (this.cw ? 1 : -1) + this.startAngle;

                    this.newPosition.set(
                        this.points[0].x + this.radius * Math.cos(angle),
                        this.points[0].y + this.radius * Math.sin(angle)
                    );
                }

                return this.newPosition;
            },
            /**
             * Returns initial path segment point's x coordinate.
             * @return {number}
             */
            initialPositionX:function () {
                return this.points[0].x;
            },
            /**
             * Returns final path segment point's x coordinate.
             * @return {number}
             */
            finalPositionX:function () {
                return this.points[1].x;
            },
            /**
             * Draws this path segment on screen. Optionally it can draw handles for every control point, in
             * this case, start and ending path segment points.
             * @param director {CAAT.Director}
             * @param bDrawHandles {boolean}
             */
            paint:function (director, bDrawHandles) {

                var ctx = director.ctx;

                ctx.save();

                ctx.strokeStyle = this.color;
                ctx.beginPath();
                if (!this.arcTo) {
                    ctx.arc(this.points[0].x, this.points[0].y, this.radius, this.startAngle, this.startAngle + this.angle, this.cw);
                } else {
                    ctx.arcTo(this.points[0].x, this.points[0].y, this.points[1].x, this.points[1].y, this.radius);
                }
                ctx.stroke();

                if (bDrawHandles) {
                    ctx.globalAlpha = 0.5;
                    ctx.fillStyle = '#7f7f00';

                    for (var i = 0; i < this.points.length; i++) {
                        this.drawHandle(ctx, this.points[i].x, this.points[i].y);
                    }
                }

                ctx.restore();
            },
            /**
             * Get the number of control points. For this type of path segment, start and
             * ending path segment points. Defaults to 2.
             * @return {number}
             */
            numControlPoints:function () {
                return this.points.length;
            },
            /**
             * @inheritsDoc
             */
            getControlPoint:function (index) {
                return this.points[index];
            },
            /**
             * @inheritsDoc
             */
            getContour:function (iSize) {
                var contour = [];

                for (var i = 0; i < iSize; i++) {
                    contour.push(
                        {
                            x:this.points[0].x + this.radius * Math.cos(i * Math.PI / (iSize / 2)),
                            y:this.points[0].y + this.radius * Math.sin(i * Math.PI / (iSize / 2))
                        }
                    );
                }

                return contour;
            },

            getPositionFromLength:function (iLength) {
                var ratio = iLength / this.length * (this.cw ? 1 : -1);
                return this.getPosition(ratio);
                /*
                 this.newPosition.set(
                 this.points[0].x + this.radius * Math.cos( 2*Math.PI * ratio ),
                 this.points[0].y + this.radius * Math.sin( 2*Math.PI * ratio )
                 );
                 return this.newPosition;*/
            },

            updatePath:function (point) {

                // just move the circle, not modify radius.
                if (this.points[1] === point) {

                    if (!this.arcTo) {
                        this.radius = Math.sqrt(
                            ( this.points[0].x - this.points[1].x ) * ( this.points[0].x - this.points[1].x ) +
                                ( this.points[0].y - this.points[1].y ) * ( this.points[0].y - this.points[1].y )
                        );
                    }

                    this.length = this.angle * this.radius;
                    this.startAngle = Math.atan2((this.points[1].y - this.points[0].y), (this.points[1].x - this.points[0].x));

                } else if (this.points[0] === point) {
                    this.points[1].set(
                        this.points[0].x + this.radius * Math.cos(this.startAngle),
                        this.points[0].y + this.radius * Math.sin(this.startAngle)
                    );
                }

                this.bbox.setEmpty();
                this.bbox.x = this.points[0].x - this.radius;
                this.bbox.y = this.points[0].y - this.radius;
                this.bbox.x1 = this.points[0].x + this.radius;
                this.bbox.y1 = this.points[0].y + this.radius;
                this.bbox.width = 2 * this.radius;
                this.bbox.height = 2 * this.radius;

                return this;
            }
        }
    }

});
/**
 * CAAT.CurvePath
 */
CAAT.Module({

    /**
     * @name CurvePath
     * @memberOf CAAT.PathUtil
     * @extends CAAT.PathUtil.PathSegment
     * @constructor
     */

    defines:"CAAT.PathUtil.CurvePath",
    depends:[
        "CAAT.PathUtil.PathSegment",
        "CAAT.Math.Point",
        "CAAT.Math.Bezier"
    ],
    aliases:["CAAT.CurvePath"],
    extendsClass:"CAAT.PathUtil.PathSegment",
    extendsWith:function () {
        return {

            /**
             * @lends CAAT.PathUtil.CurvePath.prototype
             */


            __init:function () {
                this.__super();
                this.newPosition = new CAAT.Math.Point(0, 0, 0);
                return this;
            },

            /**
             * A CAAT.Math.Curve instance.
             */
            curve:null,

            /**
             * spare holder for getPosition coordinate return.
             * @type {CAAT.Math.Point}
             */
            newPosition:null,

            applyAsPath:function (director) {
                this.curve.applyAsPath(director);
                return this;
            },
            setPoint:function (point, index) {
                if (this.curve) {
                    this.curve.setPoint(point, index);
                }
            },
            /**
             * Set this curve segment's points.
             * @param points {Array<CAAT.Point>}
             */
            setPoints:function (points) {
                var curve = new CAAT.Math.Bezier();
                curve.setPoints(points);
                this.curve = curve;
                return this;
            },
            /**
             * Set the pathSegment as a CAAT.Bezier quadric instance.
             * Parameters are quadric coordinates control points.
             *
             * @param p0x {number}
             * @param p0y {number}
             * @param p1x {number}
             * @param p1y {number}
             * @param p2x {number}
             * @param p2y {number}
             * @return this
             */
            setQuadric:function (p0x, p0y, p1x, p1y, p2x, p2y) {
                var curve = new CAAT.Math.Bezier();
                curve.setQuadric(p0x, p0y, p1x, p1y, p2x, p2y);
                this.curve = curve;
                this.updatePath();

                return this;
            },
            /**
             * Set the pathSegment as a CAAT.Bezier cubic instance.
             * Parameters are cubic coordinates control points.
             * @param p0x {number}
             * @param p0y {number}
             * @param p1x {number}
             * @param p1y {number}
             * @param p2x {number}
             * @param p2y {number}
             * @param p3x {number}
             * @param p3y {number}
             * @return this
             */
            setCubic:function (p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
                var curve = new CAAT.Math.Bezier();
                curve.setCubic(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y);
                this.curve = curve;
                this.updatePath();

                return this;
            },
            /**
             * @inheritDoc
             */
            updatePath:function (point) {
                this.curve.update();
                this.length = this.curve.getLength();
                this.curve.getBoundingBox(this.bbox);
                return this;
            },
            /**
             * @inheritDoc
             */
            getPosition:function (time) {

                if (time > 1 || time < 0) {
                    time %= 1;
                }
                if (time < 0) {
                    time = 1 + time;
                }

                this.curve.solve(this.newPosition, time);

                return this.newPosition;
            },
            /**
             * Gets the coordinate on the path relative to the path length.
             * @param iLength {number} the length at which the coordinate will be taken from.
             * @return {CAAT.Point} a CAAT.Point instance with the coordinate on the path corresponding to the
             * iLenght parameter relative to segment's length.
             */
            getPositionFromLength:function (iLength) {
                this.curve.solve(this.newPosition, iLength / this.length);
                return this.newPosition;
            },
            /**
             * Get path segment's first point's x coordinate.
             * @return {number}
             */
            initialPositionX:function () {
                return this.curve.coordlist[0].x;
            },
            /**
             * Get path segment's last point's y coordinate.
             * @return {number}
             */
            finalPositionX:function () {
                return this.curve.coordlist[this.curve.coordlist.length - 1].x;
            },
            /**
             * @inheritDoc
             * @param director {CAAT.Director}
             * @param bDrawHandles {boolean}
             */
            paint:function (director, bDrawHandles) {
                this.curve.drawHandles = bDrawHandles;
                director.ctx.strokeStyle = this.color;
                this.curve.paint(director, bDrawHandles);
            },
            /**
             * @inheritDoc
             */
            numControlPoints:function () {
                return this.curve.coordlist.length;
            },
            /**
             * @inheritDoc
             * @param index
             */
            getControlPoint:function (index) {
                return this.curve.coordlist[index];
            },
            /**
             * @inheritDoc
             */
            endCurvePosition:function () {
                return this.curve.endCurvePosition();
            },
            /**
             * @inheritDoc
             */
            startCurvePosition:function () {
                return this.curve.startCurvePosition();
            },
            /**
             * @inheritDoc
             * @param iSize
             */
            getContour:function (iSize) {
                var contour = [];
                for (var i = 0; i <= iSize; i++) {
                    contour.push({x:i / iSize, y:this.getPosition(i / iSize).y});
                }

                return contour;
            }
        }
    }

});
/**
 * CAAT.LinearPath
 */
CAAT.Module({


    /**
     * @name LinearPath
     * @memberOf CAAT.PathUtil
     * @extends CAAT.PathUtil.PathSegment
     * @constructor
     */

    defines:"CAAT.PathUtil.LinearPath",
    depends:[
        "CAAT.PathUtil.PathSegment",
        "CAAT.Math.Point"
    ],
    aliases:["CAAT.LinearPath"],
    extendsClass:"CAAT.PathUtil.PathSegment",
    extendsWith:function () {

        return  {

            /**
             * @lends CAAT.PathUtil.LinearPath.prototype
             */

            __init:function () {
                this.__super();

                this.points = [];
                this.points.push(new CAAT.Math.Point());
                this.points.push(new CAAT.Math.Point());

                this.newPosition = new CAAT.Math.Point(0, 0, 0);
                return this;
            },

            /**
             * A collection of points.
             * @type {Array.<CAAT.Math.Point>}
             */
            points:null,

            /**
             * spare holder for getPosition coordinate return.
             */
            newPosition:null,

            applyAsPath:function (director) {
                // Fixed: Thanks https://github.com/roed
                director.ctx.lineTo(this.points[1].x, this.points[1].y);
            },
            setPoint:function (point, index) {
                if (index === 0) {
                    this.points[0] = point;
                } else if (index === 1) {
                    this.points[1] = point;
                }
            },
            /**
             * Update this segments length and bounding box info.
             */
            updatePath:function (point) {
                var x = this.points[1].x - this.points[0].x;
                var y = this.points[1].y - this.points[0].y;
                this.length = Math.sqrt(x * x + y * y);

                this.bbox.setEmpty();
                this.bbox.union(this.points[0].x, this.points[0].y);
                this.bbox.union(this.points[1].x, this.points[1].y);

                return this;
            },
            setPoints:function (points) {
                this.points[0] = points[0];
                this.points[1] = points[1];
                this.updatePath();
                return this;
            },
            /**
             * Set this path segment's starting position.
             * @param x {number}
             * @param y {number}
             */
            setInitialPosition:function (x, y) {
                this.points[0].x = x;
                this.points[0].y = y;
                this.newPosition.set(x, y);
                return this;
            },
            /**
             * Set this path segment's ending position.
             * @param finalX {number}
             * @param finalY {number}
             */
            setFinalPosition:function (finalX, finalY) {
                this.points[1].x = finalX;
                this.points[1].y = finalY;
                return this;
            },
            /**
             * @inheritDoc
             */
            endCurvePosition:function () {
                return this.points[1];
            },
            /**
             * @inheritsDoc
             */
            startCurvePosition:function () {
                return this.points[0];
            },
            /**
             * @inheritsDoc
             */
            getPosition:function (time) {

                if (time > 1 || time < 0) {
                    time %= 1;
                }
                if (time < 0) {
                    time = 1 + time;
                }

                this.newPosition.set(
                    (this.points[0].x + (this.points[1].x - this.points[0].x) * time),
                    (this.points[0].y + (this.points[1].y - this.points[0].y) * time));

                return this.newPosition;
            },
            getPositionFromLength:function (len) {
                return this.getPosition(len / this.length);
            },
            /**
             * Returns initial path segment point's x coordinate.
             * @return {number}
             */
            initialPositionX:function () {
                return this.points[0].x;
            },
            /**
             * Returns final path segment point's x coordinate.
             * @return {number}
             */
            finalPositionX:function () {
                return this.points[1].x;
            },
            /**
             * Draws this path segment on screen. Optionally it can draw handles for every control point, in
             * this case, start and ending path segment points.
             * @param director {CAAT.Director}
             * @param bDrawHandles {boolean}
             */
            paint:function (director, bDrawHandles) {

                var ctx = director.ctx;

                ctx.save();

                ctx.strokeStyle = this.color;
                ctx.beginPath();
                ctx.moveTo(this.points[0].x, this.points[0].y);
                ctx.lineTo(this.points[1].x, this.points[1].y);
                ctx.stroke();

                if (bDrawHandles) {
                    ctx.globalAlpha = 0.5;
                    ctx.fillStyle = '#7f7f00';
                    ctx.beginPath();
                    this.drawHandle(ctx, this.points[0].x, this.points[0].y);
                    this.drawHandle(ctx, this.points[1].x, this.points[1].y);

                }

                ctx.restore();
            },
            /**
             * Get the number of control points. For this type of path segment, start and
             * ending path segment points. Defaults to 2.
             * @return {number}
             */
            numControlPoints:function () {
                return 2;
            },
            /**
             * @inheritsDoc
             */
            getControlPoint:function (index) {
                if (0 === index) {
                    return this.points[0];
                } else if (1 === index) {
                    return this.points[1];
                }
            },
            /**
             * @inheritsDoc
             */
            getContour:function (iSize) {
                var contour = [];

                contour.push(this.getPosition(0).clone());
                contour.push(this.getPosition(1).clone());

                return contour;
            }
        }
    }
});
CAAT.Module({

    /**
     * @name RectPath
     * @memberOf CAAT.PathUtil
     * @extends CAAT.PathUtil.PathSegment
     * @constructor
     */

    defines:"CAAT.PathUtil.RectPath",
    depends:[
        "CAAT.PathUtil.PathSegment",
        "CAAT.Math.Point",
        "CAAT.Math.Rectangle"
    ],
    aliases:["CAAT.RectPath", "CAAT.ShapePath"],
    extendsClass:"CAAT.PathUtil.PathSegment",
    extendsWith:function () {

        return {

            /**
             * @lends CAAT.PathUtil.RectPath.prototype
             */

            __init:function () {
                this.__super();

                this.points = [];
                this.points.push(new CAAT.Math.Point());
                this.points.push(new CAAT.Math.Point());
                this.points.push(new CAAT.Math.Point());
                this.points.push(new CAAT.Math.Point());
                this.points.push(new CAAT.Math.Point());

                this.newPosition = new CAAT.Math.Point();

                return this;
            },

            /**
             * A collection of Points.
             * @type {Array.<CAAT.Math.Point>}
             */
            points:null,

            /**
             * Traverse this path clockwise or counterclockwise (false).
             */
            cw:true,

            /**
             * spare point for calculations
             */
            newPosition:null,

            applyAsPath:function (director) {
                var ctx = director.ctx;

                if (this.cw) {
                    ctx.lineTo(this.points[0].x, this.points[0].y);
                    ctx.lineTo(this.points[1].x, this.points[1].y);
                    ctx.lineTo(this.points[2].x, this.points[2].y);
                    ctx.lineTo(this.points[3].x, this.points[3].y);
                    ctx.lineTo(this.points[4].x, this.points[4].y);
                } else {
                    ctx.lineTo(this.points[4].x, this.points[4].y);
                    ctx.lineTo(this.points[3].x, this.points[3].y);
                    ctx.lineTo(this.points[2].x, this.points[2].y);
                    ctx.lineTo(this.points[1].x, this.points[1].y);
                    ctx.lineTo(this.points[0].x, this.points[0].y);
                }
                return this;
            },
            setPoint:function (point, index) {
                if (index >= 0 && index < this.points.length) {
                    this.points[index] = point;
                }
            },
            /**
             * An array of {CAAT.Point} composed of two points.
             * @param points {Array<CAAT.Point>}
             */
            setPoints:function (points) {
                this.points = [];
                this.points.push(points[0]);
                this.points.push(new CAAT.Math.Point().set(points[1].x, points[0].y));
                this.points.push(points[1]);
                this.points.push(new CAAT.Math.Point().set(points[0].x, points[1].y));
                this.points.push(points[0].clone());
                this.updatePath();

                return this;
            },
            setClockWise:function (cw) {
                this.cw = cw !== undefined ? cw : true;
                return this;
            },
            isClockWise:function () {
                return this.cw;
            },
            /**
             * Set this path segment's starting position.
             * This method should not be called again after setFinalPosition has been called.
             * @param x {number}
             * @param y {number}
             */
            setInitialPosition:function (x, y) {
                for (var i = 0, l = this.points.length; i < l; i++) {
                    this.points[i].x = x;
                    this.points[i].y = y;
                }
                return this;
            },
            /**
             * Set a rectangle from points[0] to (finalX, finalY)
             * @param finalX {number}
             * @param finalY {number}
             */
            setFinalPosition:function (finalX, finalY) {
                this.points[2].x = finalX;
                this.points[2].y = finalY;

                this.points[1].x = finalX;
                this.points[1].y = this.points[0].y;

                this.points[3].x = this.points[0].x;
                this.points[3].y = finalY;

                this.points[4].x = this.points[0].x;
                this.points[4].y = this.points[0].y;

                this.updatePath();
                return this;
            },
            /**
             * @inheritDoc
             */
            endCurvePosition:function () {
                return this.points[4];
            },
            /**
             * @inheritsDoc
             */
            startCurvePosition:function () {
                return this.points[0];
            },
            /**
             * @inheritsDoc
             */
            getPosition:function (time) {

                if (time > 1 || time < 0) {
                    time %= 1;
                }
                if (time < 0) {
                    time = 1 + time;
                }

                if (-1 === this.length) {
                    this.newPosition.set(0, 0);
                } else {
                    var w = this.bbox.width / this.length;
                    var h = this.bbox.height / this.length;
                    var accTime = 0;
                    var times;
                    var segments;
                    var index = 0;

                    if (this.cw) {
                        segments = [0, 1, 2, 3, 4];
                        times = [w, h, w, h];
                    } else {
                        segments = [4, 3, 2, 1, 0];
                        times = [h, w, h, w];
                    }

                    while (index < times.length) {
                        if (accTime + times[index] < time) {
                            accTime += times[index];
                            index++;
                        } else {
                            break;
                        }
                    }
                    time -= accTime;

                    var p0 = segments[index];
                    var p1 = segments[index + 1];

                    // index tiene el indice del segmento en tiempo.
                    this.newPosition.set(
                        (this.points[p0].x + (this.points[p1].x - this.points[p0].x) * time / times[index]),
                        (this.points[p0].y + (this.points[p1].y - this.points[p0].y) * time / times[index]));
                }

                return this.newPosition;
            },
            /**
             * Returns initial path segment point's x coordinate.
             * @return {number}
             */
            initialPositionX:function () {
                return this.points[0].x;
            },
            /**
             * Returns final path segment point's x coordinate.
             * @return {number}
             */
            finalPositionX:function () {
                return this.points[2].x;
            },
            /**
             * Draws this path segment on screen. Optionally it can draw handles for every control point, in
             * this case, start and ending path segment points.
             * @param director {CAAT.Director}
             * @param bDrawHandles {boolean}
             */
            paint:function (director, bDrawHandles) {

                var ctx = director.ctx;

                ctx.save();

                ctx.strokeStyle = this.color;
                ctx.beginPath();
                ctx.strokeRect(
                    this.bbox.x, this.bbox.y,
                    this.bbox.width, this.bbox.height);

                if (bDrawHandles) {
                    ctx.globalAlpha = 0.5;
                    ctx.fillStyle = '#7f7f00';

                    for (var i = 0; i < this.points.length; i++) {
                        this.drawHandle(ctx, this.points[i].x, this.points[i].y);
                    }

                }

                ctx.restore();
            },
            /**
             * Get the number of control points. For this type of path segment, start and
             * ending path segment points. Defaults to 2.
             * @return {number}
             */
            numControlPoints:function () {
                return this.points.length;
            },
            /**
             * @inheritsDoc
             */
            getControlPoint:function (index) {
                return this.points[index];
            },
            /**
             * @inheritsDoc
             */
            getContour:function (/*iSize*/) {
                var contour = [];

                for (var i = 0; i < this.points.length; i++) {
                    contour.push(this.points[i]);
                }

                return contour;
            },
            updatePath:function (point) {

                if (point) {
                    if (point === this.points[0]) {
                        this.points[1].y = point.y;
                        this.points[3].x = point.x;
                    } else if (point === this.points[1]) {
                        this.points[0].y = point.y;
                        this.points[2].x = point.x;
                    } else if (point === this.points[2]) {
                        this.points[3].y = point.y;
                        this.points[1].x = point.x;
                    } else if (point === this.points[3]) {
                        this.points[0].x = point.x;
                        this.points[2].y = point.y;
                    }
                    this.points[4].x = this.points[0].x;
                    this.points[4].y = this.points[0].y;
                }

                this.bbox.setEmpty();

                for (var i = 0; i < 4; i++) {
                    this.bbox.union(this.points[i].x, this.points[i].y);
                }

                this.length = 2 * this.bbox.width + 2 * this.bbox.height;

                this.points[0].x = this.bbox.x;
                this.points[0].y = this.bbox.y;

                this.points[1].x = this.bbox.x + this.bbox.width;
                this.points[1].y = this.bbox.y;

                this.points[2].x = this.bbox.x + this.bbox.width;
                this.points[2].y = this.bbox.y + this.bbox.height;

                this.points[3].x = this.bbox.x;
                this.points[3].y = this.bbox.y + this.bbox.height;

                this.points[4].x = this.bbox.x;
                this.points[4].y = this.bbox.y;

                return this;
            },

            getPositionFromLength:function (iLength) {
                return this.getPosition(iLength / (this.bbox.width * 2 + this.bbox.height * 2));
            }
        }
    }
});
CAAT.Module( {

    /**
     * @name Path
     * @memberOf CAAT.PathUtil
     * @extends CAAT.PathUtil.PathSegment
     * @constructor
     */

    defines : "CAAT.PathUtil.Path",
    aliases : ["CAAT.Path"],
    depends : [
        "CAAT.PathUtil.PathSegment",
        "CAAT.PathUtil.ArcPath",
        "CAAT.PathUtil.CurvePath",
        "CAAT.PathUtil.LinearPath",
        "CAAT.PathUtil.RectPath",
        "CAAT.Math.Bezier",
        "CAAT.Math.CatmullRom",
        "CAAT.Math.Point",
        "CAAT.Math.Matrix"
    ],
    extendsClass : "CAAT.PathUtil.PathSegment",
    extendsWith : {

        /**
         * @lends CAAT.PathUtil.Path.prototype
         */


        __init : function()	{
                this.__super();

                this.newPosition=   new CAAT.Math.Point(0,0,0);
                this.pathSegments=  [];

                this.behaviorList=  [];
                this.matrix=        new CAAT.Math.Matrix();
                this.tmpMatrix=     new CAAT.Math.Matrix();

                return this;
        },

        /**
         * A collection of PathSegments.
         * @type {Array.<CAAT.PathUtil.PathSegment>}
         */
		pathSegments:	            null,   // a collection of CAAT.PathSegment instances.

        /**
         * For each path segment in this path, the normalized calculated duration.
         * precomputed segment duration relative to segment legnth/path length
         */
		pathSegmentDurationTime:	null,

        /**
         * For each path segment in this path, the normalized calculated start time.
         * precomputed segment start time relative to segment legnth/path length and duration.
         */
		pathSegmentStartTime:		null,

        /**
         * spare CAAT.Math.Point to return calculated values in the path.
         */
		newPosition:	            null,

        /**
         * path length (sum of every segment length)
         */
		pathLength:		            -1,

        /**
         * starting path x position
         */
		beginPathX:		            -1,

        /**
         * starting path y position
         */
		beginPathY:                 -1,

        /*
            last path coordinates position (using when building the path).
         */
		trackPathX:		            -1,
		trackPathY:		            -1,

        /*
            needed to drag control points.
          */
		ax:                         -1,
		ay:                         -1,
		point:                      [],

        /**
         * Is this path interactive ?. If so, controls points can be moved with a CAAT.Foundation.UI.PathActor.
         */
        interactive:                true,

        /**
         * A list of behaviors to apply to this path.
         * A path can be affine transformed to create a different path.
         */
        behaviorList:               null,

        /* rotation behavior info **/

        /**
         * Path rotation angle.
         */
        rb_angle:                   0,

        /**
         * Path rotation x anchor.
         */
        rb_rotateAnchorX:           .5,

        /**
         * Path rotation x anchor.
         */
        rb_rotateAnchorY:           .5,

        /* scale behavior info **/

        /**
         * Path X scale.
         */
        sb_scaleX:                  1,

        /**
         * Path Y scale.
         */
        sb_scaleY:                  1,

        /**
         * Path scale X anchor.
         */
        sb_scaleAnchorX:            .5,

        /**
         * Path scale Y anchor.
         */
        sb_scaleAnchorY:            .5,

        /**
         * Path translation anchor X.
         */
        tAnchorX:                   0,

        /**
         * Path translation anchor Y.
         */
        tAnchorY:                   0,

        /* translate behavior info **/

        /**
         * Path translation X.
         */
        tb_x:                       0,

        /**
         * Path translation Y.
         */
        tb_y:                       0,

        /* behavior affine transformation matrix **/

        /**
         * Path behaviors matrix.
         */
        matrix:                     null,

        /**
         * Spare calculation matrix.
         */
        tmpMatrix:                  null,

        /**
         * Original Path´s path segments points.
         */
        pathPoints:                 null,

        /**
         * Path bounding box width.
         */
        width:                      0,

        /**
         * Path bounding box height.
         */
        height:                     0,

        /**
         * Path bounding box X position.
         */
        clipOffsetX             :   0,

        /**
         * Path bounding box Y position.
         */
        clipOffsetY             :   0,

        /**
         * Is this path closed ?
         */
        closed                  :   false,

        /**
         * Apply this path as a Canvas context path.
         * You must explicitly call context.beginPath
         * @param director
         * @return {*}
         */
        applyAsPath : function(director) {
            var ctx= director.ctx;

            director.modelViewMatrix.transformRenderingContext( ctx );
            ctx.globalCompositeOperation= 'source-out';
            ctx.moveTo(
                this.getFirstPathSegment().startCurvePosition().x,
                this.getFirstPathSegment().startCurvePosition().y
            );
            for( var i=0; i<this.pathSegments.length; i++ ) {
                this.pathSegments[i].applyAsPath(director);
            }
            ctx.globalCompositeOperation= 'source-over';
            return this;
        },
        /**
         * Set whether this path should paint handles for every control point.
         * @param interactive {boolean}.
         */
        setInteractive : function(interactive) {
            this.interactive= interactive;
            return this;
        },
        getFirstPathSegment : function() {
            return this.pathSegments.length ?
                this.pathSegments[0] :
                null;
        },
        getLastPathSegment : function() {
            return this.pathSegments.length ?
                this.pathSegments[ this.pathSegments.length-1 ] :
                null;
        },
        /**
         * Return the last point of the last path segment of this compound path.
         * @return {CAAT.Point}
         */
        endCurvePosition : function() {
            if ( this.pathSegments.length ) {
                return this.pathSegments[ this.pathSegments.length-1 ].endCurvePosition();
            } else {
                return new CAAT.Math.Point().set( this.beginPathX, this.beginPathY );
            }
        },
        /**
         * Return the first point of the first path segment of this compound path.
         * @return {CAAT.Point}
         */
        startCurvePosition : function() {
            return this.pathSegments[ 0 ].startCurvePosition();
        },
        /**
         * Return the last path segment added to this path.
         * @return {CAAT.PathSegment}
         */
        getCurrentPathSegment : function() {
            return this.pathSegments[ this.pathSegments.length-1 ];
        },
        /**
         * Set the path to be composed by a single LinearPath segment.
         * @param x0 {number}
         * @param y0 {number}
         * @param x1 {number}
         * @param y1 {number}
         * @return this
         */
        setLinear : function(x0,y0,x1,y1) {
            this.pathSegments= [];
            this.beginPath(x0,y0);
            this.addLineTo(x1,y1);
            this.endPath();

            return this;
        },
        /**
         * Set this path to be composed by a single Quadric Bezier path segment.
         * @param x0 {number}
         * @param y0 {number}
         * @param x1 {number}
         * @param y1 {number}
         * @param x2 {number}
         * @param y2 {number}
         * @return this
         */
        setQuadric : function(x0,y0,x1,y1,x2,y2) {
            this.beginPath(x0,y0);
            this.addQuadricTo(x1,y1,x2,y2);
            this.endPath();

            return this;
        },
        /**
         * Sets this path to be composed by a single Cubic Bezier path segment.
         * @param x0 {number}
         * @param y0 {number}
         * @param x1 {number}
         * @param y1 {number}
         * @param x2 {number}
         * @param y2 {number}
         * @param x3 {number}
         * @param y3 {number}
         *
         * @return this
         */
        setCubic : function(x0,y0,x1,y1,x2,y2,x3,y3) {
            this.beginPath(x0,y0);
            this.addCubicTo(x1,y1,x2,y2,x3,y3);
            this.endPath();

            return this;
        },
        setRectangle : function(x0,y0, x1,y1) {
            this.beginPath(x0,y0);
            this.addRectangleTo(x1,y1);
            this.endPath();

            return this;
        },
        setCatmullRom : function( points, closed ) {
            if ( closed ) {
                points = points.slice(0)
                points.unshift(points[points.length-1])
                points.push(points[1])
                points.push(points[2])
            }

            for( var i=1; i<points.length-2; i++ ) {

                var segment= new CAAT.PathUtil.CurvePath().setColor("#000").setParent(this);
                var cm= new CAAT.Math.CatmullRom().setCurve(
                    points[ i-1 ],
                    points[ i ],
                    points[ i+1 ],
                    points[ i+2 ]
                );
                segment.curve= cm;
                this.pathSegments.push(segment);
            }
            return this;
        },
        /**
         * Add a CAAT.PathSegment instance to this path.
         * @param pathSegment {CAAT.PathSegment}
         * @return this
         *
         */
		addSegment : function(pathSegment) {
            pathSegment.setParent(this);
			this.pathSegments.push(pathSegment);
            return this;
		},
        addArcTo : function( x1,y1, x2,y2, radius, cw, color ) {
            var r= new CAAT.PathUtil.ArcPath();
            r.setArcTo(true);
            r.setRadius( radius );
            r.setInitialPosition( x1,y1).
                setFinalPosition( x2,y2 );


            r.setParent( this );
            r.setColor( color );

            this.pathSegments.push(r);

            return this;
        },
        addRectangleTo : function( x1,y1, cw, color ) {
            var r= new CAAT.PathUtil.RectPath();
            r.setPoints([
                    this.endCurvePosition(),
                    new CAAT.Math.Point().set(x1,y1)
                ]);

            r.setClockWise(cw);
            r.setColor(color);
            r.setParent(this);

            this.pathSegments.push(r);

            return this;
        },
        /**
         * Add a Quadric Bezier path segment to this path.
         * The segment starts in the current last path coordinate.
         * @param px1 {number}
         * @param py1 {number}
         * @param px2 {number}
         * @param py2 {number}
         * @param color {color=}. optional parameter. determines the color to draw the segment with (if
         *         being drawn by a CAAT.PathActor).
         *
         * @return this
         */
		addQuadricTo : function( px1,py1, px2,py2, color ) {
			var bezier= new CAAT.Math.Bezier();

            bezier.setPoints(
                [
                    this.endCurvePosition(),
                    new CAAT.Math.Point().set(px1,py1),
                    new CAAT.Math.Point().set(px2,py2)
                ]);

			this.trackPathX= px2;
			this.trackPathY= py2;
			
			var segment= new CAAT.PathUtil.CurvePath().setColor(color).setParent(this);
			segment.curve= bezier;

			this.pathSegments.push(segment);

            return this;
		},
        /**
         * Add a Cubic Bezier segment to this path.
         * The segment starts in the current last path coordinate.
         * @param px1 {number}
         * @param py1 {number}
         * @param px2 {number}
         * @param py2 {number}
         * @param px3 {number}
         * @param py3 {number}
         * @param color {color=}. optional parameter. determines the color to draw the segment with (if
         *         being drawn by a CAAT.PathActor).
         *
         * @return this
         */
		addCubicTo : function( px1,py1, px2,py2, px3,py3, color ) {
			var bezier= new CAAT.Math.Bezier();

            bezier.setPoints(
                [
                    this.endCurvePosition(),
                    new CAAT.Math.Point().set(px1,py1),
                    new CAAT.Math.Point().set(px2,py2),
                    new CAAT.Math.Point().set(px3,py3)
                ]);

			this.trackPathX= px3;
			this.trackPathY= py3;
			
			var segment= new CAAT.PathUtil.CurvePath().setColor(color).setParent(this);
			segment.curve= bezier;

			this.pathSegments.push(segment);
            return this;
		},
        /**
         * Add a Catmull-Rom segment to this path.
         * The segment starts in the current last path coordinate.
         * @param px1 {number}
         * @param py1 {number}
         * @param px2 {number}
         * @param py2 {number}
         * @param px3 {number}
         * @param py3 {number}
         * @param color {color=}. optional parameter. determines the color to draw the segment with (if
         *         being drawn by a CAAT.PathActor).
         *
         * @return this
         */
		addCatmullTo : function( px1,py1, px2,py2, px3,py3, color ) {
			var curve= new CAAT.Math.CatmullRom().setColor(color);
			curve.setCurve(this.trackPathX,this.trackPathY, px1,py1, px2,py2, px3,py3);
			this.trackPathX= px3;
			this.trackPathY= py3;
			
			var segment= new CAAT.PathUtil.CurvePath().setParent(this);
			segment.curve= curve;

			this.pathSegments.push(segment);
            return this;
		},
        /**
         * Adds a line segment to this path.
         * The segment starts in the current last path coordinate.
         * @param px1 {number}
         * @param py1 {number}
         * @param color {color=}. optional parameter. determines the color to draw the segment with (if
         *         being drawn by a CAAT.PathActor).
         *
         * @return this
         */
		addLineTo : function( px1,py1, color ) {
			var segment= new CAAT.PathUtil.LinearPath().setColor(color);
            segment.setPoints( [
                    this.endCurvePosition(),
                    new CAAT.Math.Point().set(px1,py1)
                ]);

            segment.setParent(this);

			this.trackPathX= px1;
			this.trackPathY= py1;
			
			this.pathSegments.push(segment);
            return this;
		},
        /**
         * Set the path's starting point. The method startCurvePosition will return this coordinate.
         * <p>
         * If a call to any method of the form <code>add<Segment>To</code> is called before this calling
         * this method, they will assume to start at -1,-1 and probably you'll get the wrong path.
         * @param px0 {number}
         * @param py0 {number}
         *
         * @return this
         */
		beginPath : function( px0, py0 ) {
			this.trackPathX= px0;
			this.trackPathY= py0;
			this.beginPathX= px0;
			this.beginPathY= py0;
            return this;
		},
        /**
         * <del>Close the path by adding a line path segment from the current last path
         * coordinate to startCurvePosition coordinate</del>.
         * <p>
         * This method closes a path by setting its last path segment's last control point
         * to be the first path segment's first control point.
         * <p>
         *     This method also sets the path as finished, and calculates all path's information
         *     such as length and bounding box.
         *
         * @return this
         */
		closePath : function()	{

            this.getLastPathSegment().setPoint(
                this.getFirstPathSegment().startCurvePosition(),
                this.getLastPathSegment().numControlPoints()-1 );


			this.trackPathX= this.beginPathX;
			this.trackPathY= this.beginPathY;

            this.closed= true;

			this.endPath();
            return this;
		},
        /**
         * Finishes the process of building the path. It involves calculating each path segments length
         * and proportional length related to a normalized path length of 1.
         * It also sets current paths length.
         * These calculi are needed to traverse the path appropriately.
         * <p>
         * This method must be called explicitly, except when closing a path (that is, calling the
         * method closePath) which calls this method as well.
         *
         * @return this
         */
		endPath : function() {

			this.pathSegmentStartTime=[];
			this.pathSegmentDurationTime= [];

            this.updatePath();

            return this;
		},
        /**
         * This method, returns a CAAT.Foundation.Point instance indicating a coordinate in the path.
         * The returned coordinate is the corresponding to normalizing the path's length to 1,
         * and then finding what path segment and what coordinate in that path segment corresponds
         * for the input time parameter.
         * <p>
         * The parameter time must be a value ranging 0..1.
         * If not constrained to these values, the parameter will be modulus 1, and then, if less
         * than 0, be normalized to 1+time, so that the value always ranges from 0 to 1.
         * <p>
         * This method is needed when traversing the path throughout a CAAT.Interpolator instance.
         *
         *
         * @param time {number} a value between 0 and 1 both inclusive. 0 will return path's starting coordinate.
         * 1 will return path's end coordinate.
         * @param open_contour {boolean=} treat this path as an open contour. It is intended for
         * open paths, and interpolators which give values above 1. see tutorial 7.1.
         * @link{../../documentation/tutorials/t7-1.html}
         *
         * @return {CAAT.Foundation.Point}
         */
		getPosition : function(time, open_contour) {

            if (open_contour && (time>=1 || time<=0) ) {

                var p0,p1,ratio, angle;

                if ( time>=1 ) {
                    // these values could be cached.
                    p0= this.__getPositionImpl( .999 );
                    p1= this.endCurvePosition();

                    angle= Math.atan2( p1.y - p0.y, p1.x - p0.x );
                    ratio= time%1;


                } else {
                    // these values could be cached.
                    p0= this.__getPositionImpl( .001 );
                    p1= this.startCurvePosition();

                    angle= Math.atan2( p1.y - p0.y, p1.x - p0.x );
                    ratio= -time;
                }

                var np= this.newPosition;
                var length= this.getLength();

                np.x = p1.x + (ratio * length)*Math.cos(angle);
                np.y = p1.y + (ratio * length)*Math.sin(angle);


                return np;
            }

            return this.__getPositionImpl(time);
        },

        __getPositionImpl : function(time) {

            if ( time>1 || time<0 ) {
                time%=1;
            }
            if ( time<0 ) {
                time= 1+time;
            }

            var ps= this.pathSegments;
            var psst= this.pathSegmentStartTime;
            var psdt= this.pathSegmentDurationTime;
            var l=  0;
            var r=  ps.length;
            var m;
            var np= this.newPosition;
            var psstv;
            while( l!==r ) {

                m= ((r+l)/2)|0;
                psstv= psst[m];
                if ( psstv<=time && time<=psstv+psdt[m]) {
                    time= psdt[m] ?
                            (time-psstv)/psdt[m] :
                            0;

                    // Clamp this segment's time to a maximum since it is relative to the path.
                    // thanks https://github.com/donaldducky for spotting.
                    if (time>1) {
                        time=1;
                    } else if (time<0 ) {
                        time= 0;
                    }

                    var pointInPath= ps[m].getPosition(time);
                    np.x= pointInPath.x;
                    np.y= pointInPath.y;
                    return np;
                } else if ( time<psstv ) {
                    r= m;
                } else /*if ( time>=psstv )*/ {
                    l= m+1;
                }
            }
            return this.endCurvePosition();


		},
        /**
         * Analogously to the method getPosition, this method returns a CAAT.Point instance with
         * the coordinate on the path that corresponds to the given length. The input length is
         * related to path's length.
         *
         * @param iLength {number} a float with the target length.
         * @return {CAAT.Point}
         */
		getPositionFromLength : function(iLength) {
			
			iLength%=this.getLength();
			if (iLength<0 ) {
				iLength+= this.getLength();
			}
			
			var accLength=0;
			
			for( var i=0; i<this.pathSegments.length; i++ ) {
				if (accLength<=iLength && iLength<=this.pathSegments[i].getLength()+accLength) {
					iLength-= accLength;
					var pointInPath= this.pathSegments[i].getPositionFromLength(iLength);
					this.newPosition.x= pointInPath.x;
					this.newPosition.y= pointInPath.y;
					break;
				}
				accLength+= this.pathSegments[i].getLength();
			}
			
			return this.newPosition;
		},
        /**
         * Paints the path.
         * This method is called by CAAT.PathActor instances.
         * If the path is set as interactive (by default) path segment will draw curve modification
         * handles as well.
         *
         * @param director {CAAT.Director} a CAAT.Director instance.
         */
		paint : function( director ) {
			for( var i=0; i<this.pathSegments.length; i++ ) {
				this.pathSegments[i].paint(director,this.interactive);
			}
		},
        /**
         * Method invoked when a CAAT.PathActor stops dragging a control point.
         */
		release : function() {
			this.ax= -1;
			this.ay= -1;
		},
        isEmpty : function() {
            return !this.pathSegments.length;
        },
        /**
         * Returns an integer with the number of path segments that conform this path.
         * @return {number}
         */
        getNumSegments : function() {
            return this.pathSegments.length;
        },
        /**
         * Gets a CAAT.PathSegment instance.
         * @param index {number} the index of the desired CAAT.PathSegment.
         * @return CAAT.PathSegment
         */
		getSegment : function(index) {
			return this.pathSegments[index];
		},

        numControlPoints : function() {
            return this.points.length;
        },

        getControlPoint : function(index) {
            return this.points[index];
        },

        /**
         * Indicates that some path control point has changed, and that the path must recalculate
         * its internal data, ie: length and bbox.
         */
		updatePath : function(point, callback) {
            var i,j;

            this.length=0;
            this.bbox.setEmpty();
            this.points= [];

            var xmin= Number.MAX_VALUE, ymin= Number.MAX_VALUE;
			for( i=0; i<this.pathSegments.length; i++ ) {
				this.pathSegments[i].updatePath(point);
                this.length+= this.pathSegments[i].getLength();
                this.bbox.unionRectangle( this.pathSegments[i].bbox );

                for( j=0; j<this.pathSegments[i].numControlPoints(); j++ ) {
                    var pt= this.pathSegments[i].getControlPoint( j );
                    this.points.push( pt );
                    if ( pt.x < xmin ) {
                        xmin= pt.x;
                    }
                    if ( pt.y < ymin ) {
                        ymin= pt.y;
                    }
                }
			}

            this.clipOffsetX= -xmin;
            this.clipOffsetY= -ymin;

            this.width= this.bbox.width;
            this.height= this.bbox.height;
            this.setLocation( this.bbox.x, this.bbox.y );

            this.pathSegmentStartTime=      [];
            this.pathSegmentDurationTime=   [];
            
            var i;
            for( i=0; i<this.pathSegments.length; i++) {
                this.pathSegmentStartTime.push(0);
                this.pathSegmentDurationTime.push(0);
            }

            for( i=0; i<this.pathSegments.length; i++) {
                this.pathSegmentDurationTime[i]= this.getLength() ? this.pathSegments[i].getLength()/this.getLength() : 0;
                if ( i>0 ) {
                    this.pathSegmentStartTime[i]= this.pathSegmentStartTime[i-1]+this.pathSegmentDurationTime[i-1];
                } else {
                    this.pathSegmentStartTime[0]= 0;
                }

                this.pathSegments[i].endPath();
            }

            this.extractPathPoints();

            if ( callback ) {
                callback(this);
            }

            return this;

		},
        /**
         * Sent by a CAAT.PathActor instance object to try to drag a path's control point.
         * @param x {number}
         * @param y {number}
         */
		press: function(x,y) {
            if (!this.interactive) {
                return;
            }

            var HS= CAAT.Math.Curve.prototype.HANDLE_SIZE/2;
			for( var i=0; i<this.pathSegments.length; i++ ) {
				for( var j=0; j<this.pathSegments[i].numControlPoints(); j++ ) {
					var point= this.pathSegments[i].getControlPoint(j);
					if ( x>=point.x-HS &&
						 y>=point.y-HS &&
						 x<point.x+HS &&
						 y<point.y+HS ) {
						
						this.point= point;
						return;
					}
				}
			}
			this.point= null;
		},
        /**
         * Drags a path's control point.
         * If the method press has not set needed internal data to drag a control point, this
         * method will do nothing, regardless the user is dragging on the CAAT.PathActor delegate.
         * @param x {number}
         * @param y {number}
         */
		drag : function(x,y,callback) {
            if (!this.interactive) {
                return;
            }

			if ( null===this.point ) {
				return;
			}
			
			if ( -1===this.ax || -1===this.ay ) {
				this.ax= x;
				this.ay= y;
			}
			
            this.point.x+= x-this.ax;
            this.point.y+= y-this.ay;

			this.ax= x;
			this.ay= y;

			this.updatePath(this.point,callback);
		},
        /**
         * Returns a collection of CAAT.Point objects which conform a path's contour.
         * @param iSize {number}. Number of samples for each path segment.
         * @return {[CAAT.Point]}
         */
        getContour : function(iSize) {
            var contour=[];
            for( var i=0; i<=iSize; i++ ) {
                contour.push( new CAAT.Math.Point().set( i/iSize, this.getPosition(i/iSize).y, 0 ) );
            }

            return contour;
        },

        /**
         * Reposition this path points.
         * This operation will only take place if the supplied points array equals in size to
         * this path's already set points.
         * @param points {Array<CAAT.Point>}
         */
        setPoints : function( points ) {
            if ( this.points.length===points.length ) {
                for( var i=0; i<points.length; i++ ) {
                    this.points[i].x= points[i].x;
                    this.points[i].y= points[i].y;
                }
            }
            return this;
        },

        /**
         * Set a point from this path.
         * @param point {CAAT.Point}
         * @param index {integer} a point index.
         */
        setPoint : function( point, index ) {
            if ( index>=0 && index<this.points.length ) {
                this.points[index].x= point.x;
                this.points[index].y= point.y;
            }
            return this;
        },


        /**
         * Removes all behaviors from an Actor.
         * @return this
         */
		emptyBehaviorList : function() {
			this.behaviorList=[];
            return this;
		},

        extractPathPoints : function() {
            if ( !this.pathPoints ) {
                var i;
                this.pathPoints= [];
                for ( i=0; i<this.numControlPoints(); i++ ) {
                    this.pathPoints.push( this.getControlPoint(i).clone() );
                }
            }

            return this;
        },

        /**
         * Add a Behavior to the Actor.
         * An Actor accepts an undefined number of Behaviors.
         *
         * @param behavior {CAAT.Behavior} a CAAT.Behavior instance
         * @return this
         */
		addBehavior : function( behavior )	{
			this.behaviorList.push(behavior);
//            this.extractPathPoints();
            return this;
		},
        /**
         * Remove a Behavior from the Actor.
         * If the Behavior is not present at the actor behavior collection nothing happends.
         *
         * @param behavior {CAAT.Behavior} a CAAT.Behavior instance.
         */
        removeBehaviour : function( behavior ) {
            var n= this.behaviorList.length-1;
            while(n) {
                if ( this.behaviorList[n]===behavior ) {
                    this.behaviorList.splice(n,1);
                    return this;
                }
            }

            return this;
        },
        /**
         * Remove a Behavior with id param as behavior identifier from this actor.
         * This function will remove ALL behavior instances with the given id.
         *
         * @param id {number} an integer.
         * return this;
         */
        removeBehaviorById : function( id ) {
            for( var n=0; n<this.behaviorList.length; n++ ) {
                if ( this.behaviorList[n].id===id) {
                    this.behaviorList.splice(n,1);
                }
            }

            return this;

        },

        applyBehaviors : function(time) {
//            if (this.behaviorList.length) {
                for( var i=0; i<this.behaviorList.length; i++ )	{
                    this.behaviorList[i].apply(time,this);
                }

                /** calculate behavior affine transform matrix **/
                this.setATMatrix();

                for (i = 0; i < this.numControlPoints(); i++) {
                    this.setPoint(
                        this.matrix.transformCoord(
                            this.pathPoints[i].clone().translate( this.clipOffsetX, this.clipOffsetY )), i);
                }
//            }

            return this;
        },

        setATMatrix : function() {
            this.matrix.identity();

            var m= this.tmpMatrix.identity();
            var mm= this.matrix.matrix;
            var c,s,_m00,_m01,_m10,_m11;
            var mm0, mm1, mm2, mm3, mm4, mm5;

            var bbox= this.bbox;
            var bbw= bbox.width  ;
            var bbh= bbox.height ;
            var bbx= bbox.x;
            var bby= bbox.y

            mm0= 1;
            mm1= 0;
            mm3= 0;
            mm4= 1;

            mm2= this.tb_x - bbx - this.tAnchorX * bbw;
            mm5= this.tb_y - bby - this.tAnchorY * bbh;

            if ( this.rb_angle ) {

                var rbx= (this.rb_rotateAnchorX*bbw + bbx);
                var rby= (this.rb_rotateAnchorY*bbh + bby);

                mm2+= mm0*rbx + mm1*rby;
                mm5+= mm3*rbx + mm4*rby;

                c= Math.cos( this.rb_angle );
                s= Math.sin( this.rb_angle);
                _m00= mm0;
                _m01= mm1;
                _m10= mm3;
                _m11= mm4;
                mm0=  _m00*c + _m01*s;
                mm1= -_m00*s + _m01*c;
                mm3=  _m10*c + _m11*s;
                mm4= -_m10*s + _m11*c;

                mm2+= -mm0*rbx - mm1*rby;
                mm5+= -mm3*rbx - mm4*rby;
            }

            if ( this.sb_scaleX!=1 || this.sb_scaleY!=1 ) {

                var sbx= (this.sb_scaleAnchorX*bbw + bbx);
                var sby= (this.sb_scaleAnchorY*bbh + bby);

                mm2+= mm0*sbx + mm1*sby;
                mm5+= mm3*sbx + mm4*sby;

                mm0= mm0*this.sb_scaleX;
                mm1= mm1*this.sb_scaleY;
                mm3= mm3*this.sb_scaleX;
                mm4= mm4*this.sb_scaleY;

                mm2+= -mm0*sbx - mm1*sby;
                mm5+= -mm3*sbx - mm4*sby;
            }

            mm[0]= mm0;
            mm[1]= mm1;
            mm[2]= mm2;
            mm[3]= mm3;
            mm[4]= mm4;
            mm[5]= mm5;

            return this;

        },

        setRotationAnchored : function( angle, rx, ry ) {
            this.rb_angle=          angle;
            this.rb_rotateAnchorX=  rx;
            this.rb_rotateAnchorY=  ry;
            return this;
        },

        setRotationAnchor : function( ax, ay ) {
            this.rb_rotateAnchorX= ax;
            this.rb_rotateAnchorY= ay;
        },

        setRotation : function( angle ) {
            this.rb_angle= angle;
        },

        setScaleAnchored : function( scaleX, scaleY, sx, sy ) {
            this.sb_scaleX= scaleX;
            this.sb_scaleAnchorX= sx;
            this.sb_scaleY= scaleY;
            this.sb_scaleAnchorY= sy;
            return this;
        },

        setScale : function( sx, sy ) {
            this.sb_scaleX= sx;
            this.sb_scaleY= sy;
            return this;
        },

        setScaleAnchor : function( ax, ay ) {
            this.sb_scaleAnchorX= ax;
            this.sb_scaleAnchorY= ay;
            return this;
        },

        setPositionAnchor : function( ax, ay ) {
            this.tAnchorX= ax;
            this.tAnchorY= ay;
            return this;
        },

        setPositionAnchored : function( x,y,ax,ay ) {
            this.tb_x= x;
            this.tb_y= y;
            this.tAnchorX= ax;
            this.tAnchorY= ay;
            return this;
        },

        setPosition : function( x,y ) {
            this.tb_x= x;
            this.tb_y= y;
            return this;
        },

        setLocation : function( x, y ) {
            this.tb_x= x;
            this.tb_y= y;
            return this;
        },

        flatten : function( npatches, closed ) {
            var point= this.getPositionFromLength(0);
            var path= new CAAT.PathUtil.Path().beginPath( point.x, point.y );
            for( var i=0; i<npatches; i++ ) {
                point= this.getPositionFromLength(i/npatches*this.length);
                path.addLineTo( point.x, point.y  );
            }
            if ( closed) {
                path.closePath();
            } else {
                path.endPath();
            }

            return path;
        }

    }
	
});
CAAT.Module({

    /**
     * <p>
     * This class is a SVG Path parser.
     * By calling the method parsePath( svgpath ) an instance of CAAT.PathUtil.Path will be built by parsing
     * its contents.
     *
     * <p>
     * See <a href="../../demos/demo32/svgpath.html">demo32</a>
     *
     * @name SVGPath
     * @memberOf CAAT.PathUtil
     * @constructor
     */

    defines:"CAAT.PathUtil.SVGPath",
    depends:[
        "CAAT.PathUtil.Path"
    ],
    extendsWith:function () {

        var OK = 0;
        var EOF = 1;
        var NAN = 2;

        function error(pathInfo, c) {
            var cpos = c;
            if (cpos < 0) {
                cpos = 0;
            }
            console.log("parse error near ..." + pathInfo.substr(cpos, 20));
        }

        return {

            /**
             * @lends CAAT.PathUtil.SVGPath.prototype
             */


            __init:function () {

            },

            /**
             * @private
             */
            c:0,

            /**
             * @private
             */
            bezierInfo:null,

            __skipBlank:function (pathInfo, c) {
                var p = pathInfo.charAt(c);
                while (c < pathInfo.length && (p == ' ' || p == '\n' || p == '\t' || p == ',')) {
                    ++c;
                    var p = pathInfo.charAt(c);
                }

                return c;
            },

            __maybeNumber:function (pathInfo, c) {

                if (c < pathInfo.length - 2) {

                    var p = pathInfo.charAt(c);
                    var p1 = pathInfo.charAt(c + 1);

                    return  p == '-' ||
                        this.__isDigit(p) ||
                        (p === "." && this.__isDigit(p1) );
                }

                return false;
            },

            __isDigit:function (c) {
                return c >= "0" && c <= "9";
            },


            __getNumber:function (pathInfo, c, v, error) {
                c = this.__skipBlank(pathInfo, c);
                if (c < pathInfo.length) {
                    var nc = this.__findNumber(pathInfo, c);
                    if (nc !== -1) {
                        v.push(parseFloat(pathInfo.substr(c, nc)));
                        c = this.__skipBlank(pathInfo, nc);
                        error.pos = c;
                        error.result = OK;
                        return;
                    } else {
                        error.result = NAN;
                        return;
                    }
                }

                error.result = EOF;
            },

            ____getNumbers:function (pathInfo, c, v, n, error) {

                for (var i = 0; i < n; i++) {
                    this.__getNumber(pathInfo, c, v, error);
                    if (error.result != OK) {
                        break;
                    } else {
                        c = error.pos;
                    }
                }

                return c;
            },


            __findNumber:function (pathInfo, c) {

                var p;

                if ((p = pathInfo.charAt(c)) == '-') {
                    ++c;
                }

                if (!this.__isDigit((p = pathInfo.charAt(c)))) {
                    if ((p = pathInfo.charAt(c)) != '.' || !this.__isDigit(pathInfo.charAt(c + 1))) {
                        return -1;
                    }
                }

                while (this.__isDigit((p = pathInfo.charAt(c)))) {
                    ++c;
                }

                if ((p = pathInfo.charAt(c)) == '.') {
                    ++c;
                    if (!this.__isDigit((p = pathInfo.charAt(c)))) {   // asumo un numero [d+]\. como valido.
                        return c;
                    }
                    while (this.__isDigit((p = pathInfo.charAt(c)))) {
                        ++c;
                    }
                }

                return c;
            },

            __parseMoveTo:function (pathInfo, c, absolute, path, error) {

                var numbers = [];

                c = this.____getNumbers(pathInfo, c, numbers, 2, error);

                if (error.result === OK) {
                    if (!absolute) {
                        numbers[0] += path.trackPathX;
                        numbers[1] += path.trackPathY;
                    }
                    path.beginPath(numbers[0], numbers[1]);
                } else {
                    return;
                }

                if (this.__maybeNumber(pathInfo, c)) {
                    c = this.parseLine(pathInfo, c, absolute, path, error);
                }

                error.pos = c;
            },

            __parseLine:function (pathInfo, c, absolute, path, error) {

                var numbers = [];

                do {
                    c = this.____getNumbers(pathInfo, c, numbers, 2, error);
                    if (!absolute) {
                        numbers[0] += path.trackPathX;
                        numbers[1] += path.trackPathY;
                    }
                    path.addLineTo(numbers[0], numbers[1]);

                } while (this.__maybeNumber(pathInfo, c));

                error.pos = c;
            },


            __parseLineH:function (pathInfo, c, absolute, path, error) {

                var numbers = [];

                do {
                    c = this.____getNumbers(pathInfo, c, numbers, 1, error);

                    if (!absolute) {
                        numbers[0] += path.trackPathX;
                    }
                    numbers[1].push(path.trackPathY);

                    path.addLineTo(numbers[0], numbers[1]);

                } while (this.__maybeNumber(pathInfo, c));

                error.pos = c;
            },

            __parseLineV:function (pathInfo, c, absolute, path, error) {

                var numbers = [ path.trackPathX ];

                do {
                    c = this.____getNumbers(pathInfo, c, numbers, 1, error);

                    if (!absolute) {
                        numbers[1] += path.trackPathY;
                    }

                    path.addLineTo(numbers[0], numbers[1]);

                } while (this.__maybeNumber(pathInfo, c));

                error.pos = c;
            },

            __parseCubic:function (pathInfo, c, absolute, path, error) {

                var v = [];

                do {
                    c = this.____getNumbers(pathInfo, c, v, 6, error);
                    if (error.result === OK) {
                        if (!absolute) {
                            v[0] += path.trackPathX;
                            v[1] += path.trackPathY;
                            v[2] += path.trackPathX;
                            v[3] += path.trackPathY;
                            v[4] += path.trackPathX;
                            v[5] += path.trackPathY;
                        }

                        path.addCubicTo(v[0], v[1], v[2], v[3], v[4], v[5]);


                        v.shift();
                        v.shift();
                        this.bezierInfo = v;

                    } else {
                        return;
                    }
                } while (this.__maybeNumber(pathInfo, c));

                error.pos = c;
            },

            __parseCubicS:function (pathInfo, c, absolute, path, error) {

                var v = [];

                do {
                    c = this.____getNumbers(pathInfo, c, v, 4, error);
                    if (error.result == OK) {
                        if (!absolute) {

                            v[0] += path.trackPathX;
                            v[1] += path.trackPathY;
                            v[2] += path.trackPathX;
                            v[3] += path.trackPathY;
                        }

                        var x, y;

                        x = this.bezierInfo[2] + (this.bezierInfo[2] - this.bezierInfo[0]);
                        y = this.bezierInfo[3] + (this.bezierInfo[3] - this.bezierInfo[1]);

                        path.addCubicTo(x, y, v[0], v[1], v[2], v[3]);

                        this.bezierInfo = v;

                    } else {
                        return;
                    }
                } while (this.__maybeNumber(c));

                error.pos = c;
            },

            __parseQuadricS:function (pathInfo, c, absolute, path, error) {

                var v = [];

                do {
                    c = this.____getNumbers(pathInfo, c, v, 4, error);
                    if (error.result === OK) {

                        if (!absolute) {

                            v[0] += path.trackPathX;
                            v[1] += path.trackPathY;
                        }

                        var x, y;

                        x = this.bezierInfo[2] + (this.bezierInfo[2] - this.bezierInfo[0]);
                        y = this.bezierInfo[3] + (this.bezierInfo[3] - this.bezierInfo[1]);

                        path.addQuadricTo(x, y, v[0], v[1]);

                        this.bezierInfo = [];
                        bezierInfo.push(x);
                        bezierInfo.push(y);
                        bezierInfo.push(v[0]);
                        bezierInfo.push(v[1]);


                    } else {
                        return;
                    }
                } while (this.__maybeNumber(c));

                error.pos = c;
            },


            __parseQuadric:function (pathInfo, c, absolute, path, error) {

                var v = [];

                do {
                    c = this.____getNumbers(pathInfo, c, v, 4, error);
                    if (error.result === OK) {
                        if (!absolute) {

                            v[0] += path.trackPathX;
                            v[1] += path.trackPathY;
                            v[2] += path.trackPathX;
                            v[3] += path.trackPathY;
                        }

                        path.addQuadricTo(v[0], v[1], v[2], v[3]);

                        this.bezierInfo = v;
                    } else {
                        return;
                    }
                } while (this.__maybeNumber(c));

                error.pos = c;
            },

            __parseClosePath:function (pathInfo, c, path, error) {

                path.closePath();
                error.pos= c;

            },

            /**
             * This method will create a CAAT.PathUtil.Path object with as many contours as needed.
             * @param pathInfo {string} a SVG path
             * @return Array.<CAAT.PathUtil.Path>
             */
            parsePath:function (pathInfo) {

                this.c = 0;
                this.contours= [];

                var path = new CAAT.PathUtil.Path();
                this.contours.push( path );

                this.c = this.__skipBlank(pathInfo, this.c);
                if (this.c === pathInfo.length) {
                    return path;
                }

                var ret = {
                    pos:0,
                    result:0
                }

                while (this.c != pathInfo.length) {
                    var segment = pathInfo.charAt(this.c);
                    switch (segment) {
                        case 'm':
                            this.__parseMoveTo(pathInfo, this.c + 1, false, path, ret);
                            break;
                        case 'M':
                            this.__parseMoveTo(pathInfo, this.c + 1, true, path, ret);
                            break;
                        case 'c':
                            this.__parseCubic(pathInfo, this.c + 1, false, path, ret);
                            break;
                        case 'C':
                            this.__parseCubic(pathInfo, this.c + 1, true, path, ret);
                            break;
                        case 's':
                            this.__parseCubicS(pathInfo, this.c + 1, false, path, ret);
                            break;
                        case 'S':
                            this.__parseCubicS(pathInfo, this.c + 1, true, path, ret);
                            break;
                        case 'q':
                            this.__parseQuadric(pathInfo, this.c + 1, false, path, ret);
                            break;
                        case 'Q':
                            this.__parseQuadricS(pathInfo, this.c + 1, true, path, ret);
                            break;
                        case 't':
                            this.__parseQuadricS(pathInfo, this.c + 1, false, path, ret);
                            break;
                        case 'T':
                            this.__parseQuadric(pathInfo, this.c + 1, true, path, ret);
                            break;
                        case 'l':
                            this.__parseLine(pathInfo, this.c + 1, false, path, ret);
                            break;
                        case 'L':
                            this.__parseLine(pathInfo, this.c + 1, true, path, ret);
                            break;
                        case 'h':
                            this.__parseLineH(pathInfo, this.c + 1, false, path, ret);
                            break;
                        case 'H':
                            this.__parseLineH(pathInfo, this.c + 1, true, path, ret);
                            break;
                        case 'v':
                            this.__parseLineV(pathInfo, this.c + 1, false, path, ret);
                            break;
                        case 'V':
                            this.__parseLineV(pathInfo, this.c + 1, true, path, ret);
                            break;
                        case 'z':
                        case 'Z':
                            this.__parseClosePath(pathInfo, this.c + 1, path, ret);
                            path= new CAAT.PathUtil.Path();
                            this.contours.push( path );
                            break;
                        case 0:
                            break;
                        default:
                            error(pathInfo, this.c);
                            break;
                    }

                    if (ret.result != OK) {
                        error(pathInfo, this.c);
                        break;
                    } else {
                        this.c = ret.pos;
                    }

                } // while

                var count= 0;
                var fpath= null;
                for( var i=0; i<this.contours.length; i++ ) {
                    if ( !this.contours[i].isEmpty() ) {
                        fpath= this.contours[i];
                        if ( !fpath.closed ) {
                            fpath.endPath();
                        }
                        count++;
                    }
                }

                if ( count===1 ) {
                    return fpath;
                }

                path= new CAAT.PathUtil.Path();
                for( var i=0; i<this.contours.length; i++ ) {
                    if ( !this.contours[i].isEmpty() ) {
                        path.addSegment( this.contours[i] );
                    }
                }
                return path.endPath();

            }

        }
    }
});/**
 * See LICENSE file.
 *
 */
CAAT.Module( {

    /**
     * @name GLU
     * @memberOf CAAT.WebGL
     * @namespace
     */

    defines : "CAAT.WebGL.GLU",
    depends : [
        "CAAT.Math.Matrix3"
    ],
    constants : {

        /**
         * @lends CAAT.WebGL.GLU
         */

        /**
         * Create a perspective matrix.
         *
         * @param fovy
         * @param aspect
         * @param znear
         * @param zfar
         * @param viewportHeight
         */
        makePerspective : function (fovy, aspect, znear, zfar, viewportHeight) {
            var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
            var ymin = -ymax;
            var xmin = ymin * aspect;
            var xmax = ymax * aspect;

            return makeFrustum(xmin, xmax, ymin, ymax, znear, zfar, viewportHeight);
        },

        /**
         * Create a matrix for a frustum.
         *
         * @param left
         * @param right
         * @param bottom
         * @param top
         * @param znear
         * @param zfar
         * @param viewportHeight
         */
        makeFrustum : function (left, right, bottom, top, znear, zfar, viewportHeight) {
            var X = 2*znear/(right-left);
            var Y = 2*znear/(top-bottom);
            var A = (right+left)/(right-left);
            var B = (top+bottom)/(top-bottom);
            var C = -(zfar+znear)/(zfar-znear);
            var D = -2*zfar*znear/(zfar-znear);

            return new CAAT.Math.Matrix3().initWithMatrix(
                    [
                        [X,  0,  A, -viewportHeight/2 ],
                        [0, -Y,  B,  viewportHeight/2 ],
                        [0,  0,  C,                 D ],
                        [0,  0, -1,                 0 ]
                    ]);
        },

        /**
         * Create an orthogonal projection matrix.
         * @param left
         * @param right
         * @param bottom
         * @param top
         * @param znear
         * @param zfar
         */
        makeOrtho : function (left, right, bottom, top, znear, zfar) {
            var tx = - (right + left) / (right - left) ;
            var ty = - (top + bottom) / (top - bottom) ;
            var tz = - (zfar + znear) / (zfar - znear);

            return new CAAT.Math.Matrix3().initWithMatrix(
                    [
                        [2 / (right - left), 0, 0, tx ],
                        [0, 2 / (top - bottom), 0, ty ],
                        [0, 0, -2 / (zfar- znear), tz ],
                        [0, 0, 0,                  1  ]
                    ]);
        }

    }
});
/**
 * See LICENSE file.
 */

CAAT.Module( {


    /**
     * @name WebGL
     * @memberOf CAAT
     * @namespace
     */

    /**
     * @name Program
     * @memberOf CAAT.WebGL
     * @constructor
     */


    defines : "CAAT.WebGL.Program",
    extendsWith : {

        /**
         * @lends CAAT.WebGL.Program.prototype
         */

        __init : function(gl) {
            this.gl= gl;
            return this;
        },

        /**
         *
         */
        shaderProgram:  null,

        /**
         * Canvas 3D context.
         */
        gl:             null,

        /**
         * Set fragment shader's alpha composite value.
         * @param alpha {number} float value 0..1.
         */
        setAlpha : function( alpha ) {

        },
        getShader : function (gl,type,str) {
            var shader;
            if (type === "x-shader/x-fragment") {
                shader = gl.createShader(gl.FRAGMENT_SHADER);
            } else if (type === "x-shader/x-vertex") {
                shader = gl.createShader(gl.VERTEX_SHADER);
            } else {
                return null;
            }

            gl.shaderSource(shader, str);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                alert(gl.getShaderInfoLog(shader));
                return null;
            }

            return shader;

        },
        getDomShader : function(gl, id) {
            var shaderScript = document.getElementById(id);
            if (!shaderScript) {
                return null;
            }

            var str = "";
            var k = shaderScript.firstChild;
            while (k) {
                if (k.nodeType === 3) {
                    str += k.textContent;
                }
                k = k.nextSibling;
            }

            var shader;
            if (shaderScript.type === "x-shader/x-fragment") {
                shader = gl.createShader(gl.FRAGMENT_SHADER);
            } else if (shaderScript.type === "x-shader/x-vertex") {
                shader = gl.createShader(gl.VERTEX_SHADER);
            } else {
                return null;
            }

            gl.shaderSource(shader, str);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                alert(gl.getShaderInfoLog(shader));
                return null;
            }

            return shader;
        },
        initialize : function() {
            return this;
        },
        getFragmentShader : function() {
            return null;
        },
        getVertexShader : function() {
            return null;
        },
        create : function() {
            var gl= this.gl;

            this.shaderProgram = gl.createProgram();
            gl.attachShader(this.shaderProgram, this.getVertexShader());
            gl.attachShader(this.shaderProgram, this.getFragmentShader());
            gl.linkProgram(this.shaderProgram);
            gl.useProgram(this.shaderProgram);
            return this;
        },
        setMatrixUniform : function( caatMatrix4 ) {
            this.gl.uniformMatrix4fv(
                    this.shaderProgram.pMatrixUniform,
                    false,
                    new Float32Array(caatMatrix4.flatten()));

        },
        useProgram : function() {
            this.gl.useProgram(this.shaderProgram);
            return this;
        }
    }
});
CAAT.Module( {

    /**
     * @name ColorProgram
     * @memberOf CAAT.WebGL
     * @extends CAAT.WebGL.Program
     * @constructor
     */

    defines : "CAAT.WebGL.ColorProgram",
    aliases : ["CAAT.ColorProgram"],
    extendsClass : "CAAT.WebGL.Program",
    depends : [
        "CAAT.WebGL.Program"
    ],
    extendsWith : {

        /**
         * @lends CAAT.WebGL.ColorProgram.prototype
         */


        __init : function(gl) {
            this.__super(gl);
            return this;
        },

        /**
         * int32 Array for color Buffer
         */
        colorBuffer:    null,

        /**
         * GLBuffer for vertex buffer.
         */
        vertexPositionBuffer:   null,

        /**
         * Float32 Array for vertex buffer.
         */
        vertexPositionArray:    null,

        getFragmentShader : function() {
            return this.getShader(this.gl, "x-shader/x-fragment",
                    "#ifdef GL_ES \n"+
                    "precision highp float; \n"+
                    "#endif \n"+

                    "varying vec4 color; \n"+
                            
                    "void main(void) { \n"+
                    "  gl_FragColor = color;\n"+
                    "}\n"
                    );

        },
        getVertexShader : function() {
            return this.getShader(this.gl, "x-shader/x-vertex",
                    "attribute vec3 aVertexPosition; \n"+
                    "attribute vec4 aColor; \n"+
                    "uniform mat4 uPMatrix; \n"+
                    "varying vec4 color; \n"+

                    "void main(void) { \n"+
                    "gl_Position = uPMatrix * vec4(aVertexPosition, 1.0); \n"+
                    "color= aColor; \n"+
                    "}\n"
                    );
        },
        initialize : function() {
            this.shaderProgram.vertexPositionAttribute =
                    this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
            this.gl.enableVertexAttribArray(
                    this.shaderProgram.vertexPositionAttribute);

            this.shaderProgram.vertexColorAttribute =
                    this.gl.getAttribLocation(this.shaderProgram, "aColor");
            this.gl.enableVertexAttribArray(
                    this.shaderProgram.vertexColorAttribute);

            this.shaderProgram.pMatrixUniform =
                    this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");

            this.useProgram();

            this.colorBuffer= this.gl.createBuffer();
            this.setColor( [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1] );

            var maxTris=512, i;
            /// set vertex data
            this.vertexPositionBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer );
            this.vertexPositionArray= new Float32Array(maxTris*12);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexPositionArray, this.gl.DYNAMIC_DRAW);
            this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);

            return CAAT.ColorProgram.superclass.initialize.call(this);
        },
        setColor : function( colorArray ) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer );
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colorArray), this.gl.STATIC_DRAW);

            this.gl.vertexAttribPointer(
                    this.shaderProgram.vertexColorAttribute,
                    this.colorBuffer,
                    this.gl.FLOAT,
                    false,
                    0,
                    0);
        }
    }

});
CAAT.Module( {

    /**
     * @name TextureProgram
     * @memberOf CAAT.WebGL
     * @extends CAAT.WebGL.Program
     * @constructor
     */

    defines : "CAAT.WebGL.TextureProgram",
    aliases : ["CAAT.TextureProgram"],
    extendsClass : "CAAT.WebGL.Program",
    depends : [
        "CAAT.WebGL.Program"
    ],
    extendsWith : {

        /**
         * @lends CAAT.WebGL.TextureProgram.prototype
         */

        __init : function(gl) {
            this.__super(gl);
            return this;
        },

        /**
         * VertextBuffer GLBuffer
         */
        vertexPositionBuffer:   null,

        /**
         * VertextBuffer Float32 Array
         */
        vertexPositionArray:    null,

        /**
         * UVBuffer GLBuffer
         */
        vertexUVBuffer:         null,

        /**
         * VertexBuffer Float32 Array
         */
        vertexUVArray:          null,

        /**
         * VertexIndex GLBuffer.
         */
        vertexIndexBuffer:      null,

        /**
         * Lines GLBuffer
         */
        linesBuffer:            null,

        /**
         *
         */
        prevAlpha:              -1,

        /**
         *
         */
        prevR:                  -1,

        /**
         *
         */
        prevG:                  -1,

        /**
         *
         */
        prevB:                  -1,

        /**
         *
         */
        prevA:                  -1,

        /**
         *
         */
        prevTexture:            null,

        getFragmentShader : function() {
            return this.getShader( this.gl, "x-shader/x-fragment",
                    "#ifdef GL_ES \n"+
                    "precision highp float; \n"+
                    "#endif \n"+

                    "varying vec2 vTextureCoord; \n"+
                    "uniform sampler2D uSampler; \n"+
                    "uniform float alpha; \n"+
                    "uniform bool uUseColor;\n"+
                    "uniform vec4 uColor;\n"+

                    "void main(void) { \n"+

                    "if ( uUseColor ) {\n"+
                    "  gl_FragColor= vec4(uColor.r*alpha, uColor.g*alpha, uColor.b*alpha, uColor.a*alpha);\n"+
                    "} else { \n"+
                    "  vec4 textureColor= texture2D(uSampler, vec2(vTextureCoord)); \n"+
// Fix FF   "  gl_FragColor = vec4(textureColor.rgb, textureColor.a * alpha); \n"+
                    "  gl_FragColor = vec4(textureColor.r*alpha, textureColor.g*alpha, textureColor.b*alpha, textureColor.a * alpha ); \n"+
                    "}\n"+

                    "}\n"
                    );
        },
        getVertexShader : function() {
            return this.getShader(this.gl, "x-shader/x-vertex",
                    "attribute vec3 aVertexPosition; \n"+
                    "attribute vec2 aTextureCoord; \n"+

                    "uniform mat4 uPMatrix; \n"+

                    "varying vec2 vTextureCoord; \n"+

                    "void main(void) { \n"+
                    "gl_Position = uPMatrix * vec4(aVertexPosition, 1.0); \n"+
                    "vTextureCoord = aTextureCoord;\n"+
                    "}\n"
                    );
        },
        useProgram : function() {
            CAAT.TextureProgram.superclass.useProgram.call(this);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer );
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexUVBuffer);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
        },
        initialize : function() {

            var i;

            this.linesBuffer= this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.linesBuffer );
            var arr= [];
            for( i=0; i<1024; i++ ) {
                arr[i]= i;
            }
            this.linesBufferArray= new Uint16Array(arr);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.linesBufferArray, this.gl.DYNAMIC_DRAW);


            this.shaderProgram.vertexPositionAttribute =
                    this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
            this.gl.enableVertexAttribArray(
                    this.shaderProgram.vertexPositionAttribute);

            this.shaderProgram.textureCoordAttribute =
                    this.gl.getAttribLocation(this.shaderProgram, "aTextureCoord");
            this.gl.enableVertexAttribArray(
                    this.shaderProgram.textureCoordAttribute);

            this.shaderProgram.pMatrixUniform =
                    this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");
            this.shaderProgram.samplerUniform =
                    this.gl.getUniformLocation(this.shaderProgram, "uSampler");
            this.shaderProgram.alphaUniform   =
                    this.gl.getUniformLocation(this.shaderProgram, "alpha");
            this.shaderProgram.useColor =
                    this.gl.getUniformLocation(this.shaderProgram, "uUseColor");
            this.shaderProgram.color =
                    this.gl.getUniformLocation(this.shaderProgram, "uColor");

            this.setAlpha(1);
            this.setUseColor(false);

            var maxTris=4096;
            /// set vertex data
            this.vertexPositionBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer );
            this.vertexPositionArray= new Float32Array(maxTris*12);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexPositionArray, this.gl.DYNAMIC_DRAW);
            this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);

            // uv info
            this.vertexUVBuffer= this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexUVBuffer);
            this.vertexUVArray= new Float32Array(maxTris*8);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexUVArray, this.gl.DYNAMIC_DRAW);
            this.gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, 2, this.gl.FLOAT, false, 0, 0);

            // vertex index
            this.vertexIndexBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);            
            var vertexIndex = [];
            for( i=0; i<maxTris; i++ ) {
                vertexIndex.push(0 + i*4); vertexIndex.push(1 + i*4); vertexIndex.push(2 + i*4);
                vertexIndex.push(0 + i*4); vertexIndex.push(2 + i*4); vertexIndex.push(3 + i*4);
            }
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndex), this.gl.DYNAMIC_DRAW);

            return CAAT.TextureProgram.superclass.initialize.call(this);
        },
        setUseColor : function( use,r,g,b,a ) {
            this.gl.uniform1i(this.shaderProgram.useColor, use?1:0);
            if ( use ) {
                if ( this.prevA!==a || this.prevR!==r || this.prevG!==g || this.prevB!==b ) {
                    this.gl.uniform4f(this.shaderProgram.color, r,g,b,a );
                    this.prevA= a;
                    this.prevR= r;
                    this.prevG= g;
                    this.prevB= b;
                }
            }
        },
        setTexture : function( glTexture ) {
            if ( this.prevTexture!==glTexture ) {
                var gl= this.gl;

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, glTexture);
                gl.uniform1i(this.shaderProgram.samplerUniform, 0);

                this.prevTexture= glTexture;
            }

            return this;
        },
        updateVertexBuffer : function(vertexArray) {
            var gl= this.gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer );
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertexArray);
            return this;
        },
        updateUVBuffer : function(uvArray) {
            var gl= this.gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexUVBuffer );
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, uvArray);
            return this;
        },
        setAlpha : function(alpha) {
            if ( this.prevAlpha !== alpha ) {
                this.gl.uniform1f(
                    this.shaderProgram.alphaUniform, alpha);
                this.prevAlpha= alpha;
            }
            return this;
        },
        /**
         *
         * @param lines_data {Float32Array} array of number with x,y,z coords for each line point.
         * @param size {number} number of lines to draw.
         * @param r
         * @param g
         * @param b
         * @param a
         * @param lineWidth {number} drawing line size.
         */
        drawLines : function( lines_data, size, r,g,b,a, lineWidth ) {
            var gl= this.gl;

            this.setAlpha( a );

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.linesBuffer );
            gl.lineWidth(lineWidth);

            this.updateVertexBuffer(lines_data);
            this.setUseColor(true, r,g,b,1 );
            gl.drawElements(gl.LINES, size, gl.UNSIGNED_SHORT, 0);

            /// restore
            this.setAlpha( 1 );
            this.setUseColor(false);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);

        },
        /**
         * 
         * @param polyline_data
         * @param size
         * @param r
         * @param g
         * @param b
         * @param a
         * @param lineWidth
         */
        drawPolylines : function( polyline_data, size, r,g,b,a, lineWidth ) {
            var gl= this.gl;

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.linesBuffer );
            gl.lineWidth(lineWidth);

            this.setAlpha(a);

            this.updateVertexBuffer(polyline_data);
            this.setUseColor(true, r,g,b,1 );
            gl.drawElements(gl.LINE_STRIP, size, gl.UNSIGNED_SHORT, 0);

            /// restore
            this.setAlpha( 1 );
            this.setUseColor(false);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);

        }
    }
});
CAAT.Module( {

    /**
     * @name TouchInfo
     * @memberOf CAAT.Event
     * @constructor
     */

    defines : "CAAT.Event.TouchInfo",
    aliases : ["CAAT.TouchInfo"],
    extendsWith : {

        /**
         * @lends CAAT.Event.TouchInfo.prototype
         */

        /**
         * Constructor delegate.
         * @param id {number}
         * @param x {number}
         * @param y {number}
         * @param target {DOMElement}
         * @private
         */
        __init : function( id, x, y, target ) {

            this.identifier= id;
            this.clientX= x;
            this.pageX= x;
            this.clientY= y;
            this.pageY= y;
            this.target= target;
            this.time= new Date().getTime();

            return this;
        }
    }
});
CAAT.Module( {

    /**
     * @name TouchEvent
     * @memberOf CAAT.Event
     * @constructor
     */


    defines : "CAAT.Event.TouchEvent",
    aliases : ["CAAT.TouchEvent"],
    depends : [
        "CAAT.Event.TouchInfo"
    ],
    extendsWith : {

        /**
         * @lends CAAT.Event.TouchEvent.prototype
         */

        /**
         * Constructor delegate
         * @private
         */
        __init : function() {
            this.touches= [];
            this.changedTouches= [];
            return this;
        },

        /**
         * Time the touch event was triggered at.
         */
		time:			0,

        /**
         * Source Actor the event happened in.
         */
		source:			null,

        /**
         * Original touch event.
         */
        sourceEvent:    null,

        /**
         * Was shift pressed ?
         */
        shift:          false,

        /**
         * Was control pressed ?
         */
        control:        false,

        /**
         * Was alt pressed ?
         */
        alt:            false,

        /**
         * Was meta pressed ?
         */
        meta:           false,

        /**
         * touches collection
         */
        touches         : null,

        /**
         * changed touches collection
         */
        changedTouches  : null,

		init : function( sourceEvent,source,time ) {

			this.source=        source;
            this.alt =          sourceEvent.altKey;
            this.control =      sourceEvent.ctrlKey;
            this.shift =        sourceEvent.shiftKey;
            this.meta =         sourceEvent.metaKey;
            this.sourceEvent=   sourceEvent;
            this.time=          time;

			return this;
		},
        /**
         *
         * @param touchInfo
         *  <{
         *      id : <number>,
         *      point : {
         *          x: <number>,
         *          y: <number> }�
         *  }>
         * @return {*}
         */
        addTouch : function( touchInfo ) {
            if ( -1===this.touches.indexOf( touchInfo ) ) {
                this.touches.push( touchInfo );
            }
            return this;
        },
        addChangedTouch : function( touchInfo ) {
            if ( -1===this.changedTouches.indexOf( touchInfo ) ) {
                this.changedTouches.push( touchInfo );
            }
            return this;
        },
		isAltDown : function() {
			return this.alt;
		},
		isControlDown : function() {
			return this.control;
		},
		isShiftDown : function() {
			return this.shift;
		},
        isMetaDown: function() {
            return this.meta;
        },
        getSourceEvent : function() {
            return this.sourceEvent;
        }
	}
});
CAAT.Module( {

    /**
     * @name MouseEvent
     * @memberOf CAAT.Event
     * @constructor
     */

    defines : "CAAT.Event.MouseEvent",
    aliases : ["CAAT.MouseEvent"],
    depends : [
        "CAAT.Math.Point"
    ],
    extendsWith : {

        /**
         * @lends CAAT.Event.MouseEvent.prototype
         */

        /**
         * Constructor delegate
         * @private
         */
        __init : function() {
            this.point= new CAAT.Math.Point(0,0,0);
            this.screenPoint= new CAAT.Math.Point(0,0,0);
            this.touches= [];
            return this;
        },

        /**
         * Original mouse/touch screen coord
         */
		screenPoint:	null,

        /**
         * Transformed in-actor coordinate
         */
		point:			null,

        /**
         * scene time when the event was triggered.
         */
		time:			0,

        /**
         * Actor the event was produced in.
         */
		source:			null,

        /**
         * Was shift pressed ?
         */
        shift:          false,

        /**
         * Was control pressed ?
         */
        control:        false,

        /**
         * was alt pressed ?
         */
        alt:            false,

        /**
         * was Meta key pressed ?
         */
        meta:           false,

        /**
         * Original mouse/touch event
         */
        sourceEvent:    null,

        touches     :   null,

		init : function( x,y,sourceEvent,source,screenPoint,time ) {
			this.point.set(x,y);
			this.source=        source;
			this.screenPoint=   screenPoint;
            this.alt =          sourceEvent.altKey;
            this.control =      sourceEvent.ctrlKey;
            this.shift =        sourceEvent.shiftKey;
            this.meta =         sourceEvent.metaKey;
            this.sourceEvent=   sourceEvent;
            this.x=             x;
            this.y=             y;
            this.time=          time;
			return this;
		},
		isAltDown : function() {
			return this.alt;
		},
		isControlDown : function() {
			return this.control;
		},
		isShiftDown : function() {
			return this.shift;
		},
        isMetaDown: function() {
            return this.meta;
        },
        getSourceEvent : function() {
            return this.sourceEvent;
        }
	}
});
CAAT.Module( {

    /**
     * @name Event
     * @memberOf CAAT
     * @namespace
     */

    /**
     * @name KeyEvent
     * @memberOf CAAT.Event
     * @constructor
     */

    /**
     * @name KEYS
     * @memberOf CAAT
     * @namespace
     */

    /**
     * @name KEY_MODIFIERS
     * @memberOf CAAT
     * @namespace
     */

    defines : "CAAT.Event.KeyEvent",
    aliases : "CAAT.KeyEvent",
    extendsWith : {

        /**
         * @lends CAAT.Event.KeyEvent.prototype
         */

        /**
         * Define a key event.
         * @param keyCode
         * @param up_or_down
         * @param modifiers
         * @param originalEvent
         */
        __init : function( keyCode, up_or_down, modifiers, originalEvent ) {
            this.keyCode= keyCode;
            this.action=  up_or_down;
            this.modifiers= modifiers;
            this.sourceEvent= originalEvent;

            this.preventDefault= function() {
                this.sourceEvent.preventDefault();
            }

            this.getKeyCode= function() {
                return this.keyCode;
            };

            this.getAction= function() {
                return this.action;
            };

            this.modifiers= function() {
                return this.modifiers;
            };

            this.isShiftPressed= function() {
                return this.modifiers.shift;
            };

            this.isControlPressed= function() {
                return this.modifiers.control;
            };

            this.isAltPressed= function() {
                return this.modifiers.alt;
            };

            this.getSourceEvent= function() {
                return this.sourceEvent;
            };
        }
    },
    onCreate : function() {

        /**
         * @lends CAAT
         */

        /**
         * Key codes
         * @type {enum}
         */
        CAAT.KEYS = {

            /** @const */ ENTER:13,
            /** @const */ BACKSPACE:8,
            /** @const */ TAB:9,
            /** @const */ SHIFT:16,
            /** @const */ CTRL:17,
            /** @const */ ALT:18,
            /** @const */ PAUSE:19,
            /** @const */ CAPSLOCK:20,
            /** @const */ ESCAPE:27,
            /** @const */ PAGEUP:33,
            /** @const */ PAGEDOWN:34,
            /** @const */ END:35,
            /** @const */ HOME:36,
            /** @const */ LEFT:37,
            /** @const */ UP:38,
            /** @const */ RIGHT:39,
            /** @const */ DOWN:40,
            /** @const */ INSERT:45,
            /** @const */ DELETE:46,
            /** @const */ 0:48,
            /** @const */ 1:49,
            /** @const */ 2:50,
            /** @const */ 3:51,
            /** @const */ 4:52,
            /** @const */ 5:53,
            /** @const */ 6:54,
            /** @const */ 7:55,
            /** @const */ 8:56,
            /** @const */ 9:57,
            /** @const */ a:65,
            /** @const */ b:66,
            /** @const */ c:67,
            /** @const */ d:68,
            /** @const */ e:69,
            /** @const */ f:70,
            /** @const */ g:71,
            /** @const */ h:72,
            /** @const */ i:73,
            /** @const */ j:74,
            /** @const */ k:75,
            /** @const */ l:76,
            /** @const */ m:77,
            /** @const */ n:78,
            /** @const */ o:79,
            /** @const */ p:80,
            /** @const */ q:81,
            /** @const */ r:82,
            /** @const */ s:83,
            /** @const */ t:84,
            /** @const */ u:85,
            /** @const */ v:86,
            /** @const */ w:87,
            /** @const */ x:88,
            /** @const */ y:89,
            /** @const */ z:90,
            /** @const */ SELECT:93,
            /** @const */ NUMPAD0:96,
            /** @const */ NUMPAD1:97,
            /** @const */ NUMPAD2:98,
            /** @const */ NUMPAD3:99,
            /** @const */ NUMPAD4:100,
            /** @const */ NUMPAD5:101,
            /** @const */ NUMPAD6:102,
            /** @const */ NUMPAD7:103,
            /** @const */ NUMPAD8:104,
            /** @const */ NUMPAD9:105,
            /** @const */ MULTIPLY:106,
            /** @const */ ADD:107,
            /** @const */ SUBTRACT:109,
            /** @const */ DECIMALPOINT:110,
            /** @const */ DIVIDE:111,
            /** @const */ F1:112,
            /** @const */ F2:113,
            /** @const */ F3:114,
            /** @const */ F4:115,
            /** @const */ F5:116,
            /** @const */ F6:117,
            /** @const */ F7:118,
            /** @const */ F8:119,
            /** @const */ F9:120,
            /** @const */ F10:121,
            /** @const */ F11:122,
            /** @const */ F12:123,
            /** @const */ NUMLOCK:144,
            /** @const */ SCROLLLOCK:145,
            /** @const */ SEMICOLON:186,
            /** @const */ EQUALSIGN:187,
            /** @const */ COMMA:188,
            /** @const */ DASH:189,
            /** @const */ PERIOD:190,
            /** @const */ FORWARDSLASH:191,
            /** @const */ GRAVEACCENT:192,
            /** @const */ OPENBRACKET:219,
            /** @const */ BACKSLASH:220,
            /** @const */ CLOSEBRAKET:221,
            /** @const */ SINGLEQUOTE:222
        };

        /**
         * @deprecated
         * @type {Object}
         */
        CAAT.Keys= CAAT.KEYS;

        /**
         * Shift key code
         * @type {Number}
         */
        CAAT.SHIFT_KEY=    16;

        /**
         * Control key code
         * @type {Number}
         */
        CAAT.CONTROL_KEY=  17;

        /**
         * Alt key code
         * @type {Number}
         */
        CAAT.ALT_KEY=      18;

        /**
         * Enter key code
         * @type {Number}
         */
        CAAT.ENTER_KEY=    13;

        /**
         * Event modifiers.
         * @type enum
         */
        CAAT.KEY_MODIFIERS= {

            /** @const */ alt:        false,
            /** @const */ control:    false,
            /** @const */ shift:      false
        };
    }

});
CAAT.Module( {
    defines : "CAAT.Event.Input",
    depends : [
        "CAAT.Event.KeyEvent",
        "CAAT.Event.MouseEvent",
        "CAAT.Event.TouchEvent"
    ],
    onCreate : function() {

        /**
         * @lends CAAT
         */

        /**
         * Set the cursor.
         * @param cursor
         */
        CAAT.setCursor= function(cursor) {
            if ( navigator.browser!=='iOS' ) {
                document.body.style.cursor= cursor;
            }
        };


        /**
         * Constant to set touch behavior as single touch, compatible with mouse.
         * @type {Number}
         * @constant
         */
        CAAT.TOUCH_AS_MOUSE=        1;

        /**
         * Constant to set CAAT touch behavior as multitouch.
         * @type {Number}
         * @contant
         */
        CAAT.TOUCH_AS_MULTITOUCH=   2;

        /**
         * Set CAAT touch behavior as single or multi touch.
         * @type {Number}
         */
        CAAT.TOUCH_BEHAVIOR= CAAT.TOUCH_AS_MOUSE;

        /**
         * Array of window resize listeners.
         * @type {Array}
         */
        CAAT.windowResizeListeners= [];

        /**
         * Register a function callback as window resize listener.
         * @param f
         */
        CAAT.registerResizeListener= function(f) {
            CAAT.windowResizeListeners.push(f);
        };

        /**
         * Remove a function callback as window resize listener.
         * @param director
         */
        CAAT.unregisterResizeListener= function(director) {
            for( var i=0; i<CAAT.windowResizeListeners.length; i++ ) {
                if ( director===CAAT.windowResizeListeners[i] ) {
                    CAAT.windowResizeListeners.splice(i,1);
                    return;
                }
            }
        };

        /**
         * Aray of Key listeners.
         */
        CAAT.keyListeners= [];

        /**
         * Register a function callback as key listener.
         * @param f
         */
        CAAT.registerKeyListener= function(f) {
            CAAT.keyListeners.push(f);
        };

        /**
         * Acceleration data.
         * @type {Object}
         */
        CAAT.accelerationIncludingGravity= {
            x:0,
            y:0,
            z:0
        };

        /**
         * Device motion angles.
         * @type {Object}
         */
        CAAT.rotationRate= {
            alpha: 0,
            beta:0,
            gamma: 0 };

        /**
         * Enable device motion events.
         * This function does not register a callback, instear it sets
         * CAAT.rotationRate and CAAt.accelerationIncludingGravity values.
         */
        CAAT.enableDeviceMotion= function() {

            CAAT.prevOnDeviceMotion=    null;   // previous accelerometer callback function.
            CAAT.onDeviceMotion=        null;   // current accelerometer callback set for CAAT.

            function tilt(data) {
                CAAT.rotationRate= {
                        alpha : 0,
                        beta  : data[0],
                        gamma : data[1]
                    };
            }

            if (window.DeviceOrientationEvent) {
                window.addEventListener("deviceorientation", function (event) {
                    tilt([event.beta, event.gamma]);
                }, true);
            } else if (window.DeviceMotionEvent) {
                window.addEventListener('devicemotion', function (event) {
                    tilt([event.acceleration.x * 2, event.acceleration.y * 2]);
                }, true);
            } else {
                window.addEventListener("MozOrientation", function (event) {
                    tilt([-event.y * 45, event.x * 45]);
                }, true);
            }

        };


        /**
         * Enable window level input events, keys and redimension.
         */
        window.addEventListener('keydown',
            function(evt) {
                var key = (evt.which) ? evt.which : evt.keyCode;

                if ( key===CAAT.SHIFT_KEY ) {
                    CAAT.KEY_MODIFIERS.shift= true;
                } else if ( key===CAAT.CONTROL_KEY ) {
                    CAAT.KEY_MODIFIERS.control= true;
                } else if ( key===CAAT.ALT_KEY ) {
                    CAAT.KEY_MODIFIERS.alt= true;
                } else {
                    for( var i=0; i<CAAT.keyListeners.length; i++ ) {
                        CAAT.keyListeners[i]( new CAAT.KeyEvent(
                            key,
                            'down',
                            {
                                alt:        CAAT.KEY_MODIFIERS.alt,
                                control:    CAAT.KEY_MODIFIERS.control,
                                shift:      CAAT.KEY_MODIFIERS.shift
                            },
                            evt)) ;
                    }
                }
            },
            false);

        window.addEventListener('keyup',
            function(evt) {

                var key = (evt.which) ? evt.which : evt.keyCode;
                if ( key===CAAT.SHIFT_KEY ) {
                    CAAT.KEY_MODIFIERS.shift= false;
                } else if ( key===CAAT.CONTROL_KEY ) {
                    CAAT.KEY_MODIFIERS.control= false;
                } else if ( key===CAAT.ALT_KEY ) {
                    CAAT.KEY_MODIFIERS.alt= false;
                } else {

                    for( var i=0; i<CAAT.keyListeners.length; i++ ) {
                        CAAT.keyListeners[i]( new CAAT.KeyEvent(
                            key,
                            'up',
                            {
                                alt:        CAAT.KEY_MODIFIERS.alt,
                                control:    CAAT.KEY_MODIFIERS.control,
                                shift:      CAAT.KEY_MODIFIERS.shift
                            },
                            evt));
                    }
                }
            },
            false );

        window.addEventListener('resize',
            function(evt) {
                for( var i=0; i<CAAT.windowResizeListeners.length; i++ ) {
                    CAAT.windowResizeListeners[i].windowResized(
                            window.innerWidth,
                            window.innerHeight);
                }
            },
            false);

    },
    extendsWith : {
    }
});
CAAT.Module({
    defines:"CAAT.Event.AnimationLoop",
    onCreate : function() {

        /**
         * @lends CAAT
         */

        /**
         * if RAF, this value signals end of RAF.
         * @type {Boolean}
         */
        CAAT.ENDRAF=false;

        /**
         * if setInterval, this value holds CAAT.setInterval return value.
         * @type {null}
         */
        CAAT.INTERVAL_ID=null;

        /**
         * Boolean flag to determine if CAAT.loop has already been called.
         * @type {Boolean}
         */
        CAAT.renderEnabled=false;

        /**
         * expected FPS when using setInterval animation.
         * @type {Number}
         */
        CAAT.FPS=60;

        /**
         * Use RAF shim instead of setInterval. Set to != 0 to use setInterval.
         * @type {Number}
         */
        CAAT.NO_RAF=0;

        /**
         * debug panel update time.
         * @type {Number}
         */
        CAAT.FPS_REFRESH=500;

        /**
         * requestAnimationFrame time reference.
         * @type {Number}
         */
        CAAT.RAF=0;

        /**
         * time between two consecutive RAF. usually bigger than FRAME_TIME
         * @type {Number}
         */
        CAAT.REQUEST_ANIMATION_FRAME_TIME=0;

        /**
         * time between two consecutive setInterval calls.
         * @type {Number}
         */
        CAAT.SET_INTERVAL=0;

        /**
         * time to process one frame.
         * @type {Number}
         */
        CAAT.FRAME_TIME=0;

        /**
         * Current animated director.
         * @type {CAAT.Foundation.Director}
         */
        CAAT.currentDirector=null;

        /**
         * Registered director objects.
         * @type {Array}
         */
        CAAT.director=[];

        /**
         * Register and keep track of every CAAT.Director instance in the document.
         */
        CAAT.RegisterDirector=function (director) {
            if (!CAAT.currentDirector) {
                CAAT.currentDirector = director;
            }
            CAAT.director.push(director);
        };

        /**
         * Return current scene.
         * @return {CAAT.Foundation.Scene}
         */
        CAAT.getCurrentScene=function () {
            return CAAT.currentDirector.getCurrentScene();
        };

        /**
         * Return current director's current scene's time.
         * The way to go should be keep local scene references, but anyway, this function is always handy.
         * @return {number} current scene's virtual time.
         */
        CAAT.getCurrentSceneTime=function () {
            return CAAT.currentDirector.getCurrentScene().time;
        };

        /**
         * Stop animation loop.
         */
        CAAT.endLoop=function () {
            if (CAAT.NO_RAF) {
                if (CAAT.INTERVAL_ID !== null) {
                    clearInterval(CAAT.INTERVAL_ID);
                }
            } else {
                CAAT.ENDRAF = true;
            }

            CAAT.renderEnabled = false;
        };

        /**
         * Main animation loop entry point.
         * Must called only once, or only after endLoop.
         *
         * @param fps {number} desired fps. fps parameter will only be used if CAAT.NO_RAF is specified, that is
         * switch from RequestAnimationFrame to setInterval for animation loop.
         */
        CAAT.loop=function (fps) {
            if (CAAT.renderEnabled) {
                return;
            }

            for (var i = 0, l = CAAT.director.length; i < l; i++) {
                CAAT.director[i].timeline = new Date().getTime();
            }

            CAAT.FPS = fps || 60;
            CAAT.renderEnabled = true;
            if (CAAT.NO_RAF) {
                CAAT.INTERVAL_ID = setInterval(
                    function () {
                        var t = new Date().getTime();

                        for (var i = 0, l = CAAT.director.length; i < l; i++) {
                            var dr = CAAT.director[i];
                            if (dr.renderMode === CAAT.Foundation.Director.RENDER_MODE_CONTINUOUS || dr.needsRepaint) {
                                dr.renderFrame();
                            }
                        }

                        CAAT.FRAME_TIME = t - CAAT.SET_INTERVAL;

                        if (CAAT.RAF) {
                            CAAT.REQUEST_ANIMATION_FRAME_TIME = new Date().getTime() - CAAT.RAF;
                        }
                        CAAT.RAF = new Date().getTime();

                        CAAT.SET_INTERVAL = t;

                    },
                    1000 / CAAT.FPS
                );
            } else {
                CAAT.renderFrameRAF();
            }
        };
        
        CAAT.renderFrameRAF= function (now) {
            var c= CAAT;

            if (c.ENDRAF) {
                c.ENDRAF = false;
                return;
            }

            if (!now) now = new Date().getTime();

            var t= new Date().getTime();
            c.REQUEST_ANIMATION_FRAME_TIME = c.RAF ? now - c.RAF : 16;
            for (var i = 0, l = c.director.length; i < l; i++) {
                c.director[i].renderFrame();
            }
            c.RAF = now;
            c.FRAME_TIME = new Date().getTime() - t;


            window.requestAnimFrame(c.renderFrameRAF, 0);
        };
        
        /**
         * Polyfill for requestAnimationFrame.
         */
        window.requestAnimFrame = (function () {
            return  window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function raf(/* function */ callback, /* DOMElement */ element) {
                    window.setTimeout(callback, 1000 / CAAT.FPS);
                };
        })();        
    },

    extendsWith:function () {
        return {
        };
    }
});
CAAT.Module( {

    /**
     * @name TimerTask
     * @memberOf CAAT.Foundation.Timer
     * @constructor
     */

    defines : "CAAT.Foundation.Timer.TimerTask",
    aliases : ["CAAT.TimerTask"],
    extendsWith : {

        /**
         * @lends CAAT.Foundation.Timer.TimerTask.prototype
         */

        /**
         * Timer start time. Relative to Scene or Director time, depending who owns this TimerTask.
         */
        startTime:          0,

        /**
         * Timer duration.
         */
        duration:           0,

        /**
         * This callback will be called only once, when the timer expires.
         */
        callback_timeout:   null,

        /**
         * This callback will be called whenever the timer is checked in time.
         */
        callback_tick:      null,

        /**
         * This callback will be called when the timer is cancelled.
         */
        callback_cancel:    null,

        /**
         * What TimerManager instance owns this task.
         */
        owner:              null,

        /**
         * Scene or director instance that owns this TimerTask owner.
         */
        scene:              null,   // scene or director instance

        /**
         * An arbitrry id.
         */
        taskId:             0,

        /**
         * Remove this timer task on expiration/cancellation ?
         */
        remove:             false,

        /**
         * Create a TimerTask.
         * The taskId will be set by the scene.
         * @param startTime {number} an integer indicating TimerTask enable time.
         * @param duration {number} an integer indicating TimerTask duration.
         * @param callback_timeout {function( sceneTime {number}, timertaskTime{number}, timertask {CAAT.TimerTask} )} on timeout callback function.
         * @param callback_tick {function( sceneTime {number}, timertaskTime{number}, timertask {CAAT.TimerTask} )} on tick callback function.
         * @param callback_cancel {function( sceneTime {number}, timertaskTime{number}, timertask {CAAT.TimerTask} )} on cancel callback function.
         *
         * @return this
         */
        create: function( startTime, duration, callback_timeout, callback_tick, callback_cancel ) {
            this.startTime=         startTime;
            this.duration=          duration;
            this.callback_timeout=  callback_timeout;
            this.callback_tick=     callback_tick;
            this.callback_cancel=   callback_cancel;
            return this;
        },
        /**
         * Performs TimerTask operation. The task will check whether it is in frame time, and will
         * either notify callback_timeout or callback_tick.
         *
         * @param time {number} an integer indicating scene time.
         * @return this
         *
         * @protected
         *
         */
        checkTask : function(time) {
            var ttime= time;
            ttime-= this.startTime;
            if ( ttime>=this.duration ) {
                this.remove= true;
                if( this.callback_timeout ) {
                    this.callback_timeout( time, ttime, this );
                }
            } else {
                if ( this.callback_tick ) {
                    this.callback_tick( time, ttime, this );
                }
            }
            return this;
        },
        remainingTime : function() {
            return this.duration - (this.scene.time-this.startTime);
        },
        /**
         * Reschedules this TimerTask by changing its startTime to current scene's time.
         * @param time {number} an integer indicating scene time.
         * @return this
         */
        reset : function( time ) {
            this.remove= false;
            this.startTime=  time;
            this.owner.ensureTimerTask(this);
            return this;
        },
        /**
         * Cancels this timer by removing it on scene's next frame. The function callback_cancel will
         * be called.
         * @return this
         */
        cancel : function() {
            this.remove= true;
            if ( null!=this.callback_cancel ) {
                this.callback_cancel( this.scene.time, this.scene.time-this.startTime, this );
            }
            return this;
        },
        addTime : function( time ) {
            this.duration+= time;
            return this;
        }
    }
});
/**
 * See LICENSE file.
 */
CAAT.Module({

    /**
     * @name Timer
     * @memberOf CAAT.Foundation
     * @namespace
     */

    /**
     * @name TimerManager
     * @memberOf CAAT.Foundation.Timer
     * @constructor
     */

    defines : "CAAT.Foundation.Timer.TimerManager",
    aliases : ["CAAT.TimerManager"],
    depends : [
        "CAAT.Foundation.Timer.TimerTask"
    ],
    extendsWith :   {

        /**
         * @lends CAAT.Foundation.Timer.TimerManager.prototype
         */

        __init:function () {
            this.timerList = [];
            return this;
        },

        /**
         * Collection of registered timers.
         * @type {CAAT.Foundation.Timer.TimerManager}
         * @private
         */
        timerList:null,

        /**
         * Index sequence to idenfity registered timers.
         * @private
         */
        timerSequence:0,

        /**
         * Check and apply timers in frame time.
         * @param time {number} the current Scene time.
         */
        checkTimers:function (time) {
            var tl = this.timerList;
            var i = tl.length - 1;
            while (i >= 0) {
                if (!tl[i].remove) {
                    tl[i].checkTask(time);
                }
                i--;
            }
        },
        /**
         * Make sure the timertask is contained in the timer task list by adding it to the list in case it
         * is not contained.
         * @param timertask {CAAT.Foundation.Timer.TimerTask}.
         * @return this
         */
        ensureTimerTask:function (timertask) {
            if (!this.hasTimer(timertask)) {
                this.timerList.push(timertask);
            }
            return this;
        },
        /**
         * Check whether the timertask is in this scene's timer task list.
         * @param timertask {CAAT.Foundation.Timer.TimerTask}.
         * @return {boolean} a boolean indicating whether the timertask is in this scene or not.
         */
        hasTimer:function (timertask) {
            var tl = this.timerList;
            var i = tl.length - 1;
            while (i >= 0) {
                if (tl[i] === timertask) {
                    return true;
                }
                i--;
            }

            return false;
        },
        /**
         * Creates a timer task. Timertask object live and are related to scene's time, so when an Scene
         * is taken out of the Director the timer task is paused, and resumed on Scene restoration.
         *
         * @param startTime {number} an integer indicating the scene time this task must start executing at.
         * @param duration {number} an integer indicating the timerTask duration.
         * @param callback_timeout {function} timer on timeout callback function.
         * @param callback_tick {function} timer on tick callback function.
         * @param callback_cancel {function} timer on cancel callback function.
         *
         * @return {CAAT.TimerTask} a CAAT.TimerTask class instance.
         */
        createTimer:function (startTime, duration, callback_timeout, callback_tick, callback_cancel, scene) {

            var tt = new CAAT.Foundation.Timer.TimerTask().create(
                startTime,
                duration,
                callback_timeout,
                callback_tick,
                callback_cancel);

            tt.taskId = this.timerSequence++;
            tt.sceneTime = scene.time;
            tt.owner = this;
            tt.scene = scene;

            this.timerList.push(tt);

            return tt;
        },
        /**
         * Removes expired timers. This method must not be called directly.
         */
        removeExpiredTimers:function () {
            var i;
            var tl = this.timerList;
            for (i = 0; i < tl.length; i++) {
                if (tl[i].remove) {
                    tl.splice(i, 1);
                }
            }
        }
    }
});
CAAT.Module( {

    /**
     * @name Layout
     * @memberOf CAAT.Foundation.UI
     * @namespace
     */

    /**
     * @name LayoutManager
     * @memberOf CAAT.Foundation.UI.Layout
     * @constructor
     */

    defines : "CAAT.Foundation.UI.Layout.LayoutManager",
    aliases : ["CAAT.UI.LayoutManager"],
    depends : [
        "CAAT.Behavior.Interpolator"
    ],
    constants : {

        /**
         * @lends CAAT.Foundation.UI.Layout.LayoutManager
         */

        /**
         * @enum {number}
         */
        AXIS: {
            X : 0,
            Y : 1
        },

        /**
         * @enum {number}
         */
        ALIGNMENT : {
            LEFT :  0,
            RIGHT:  1,
            CENTER: 2,
            TOP:    3,
            BOTTOM: 4,
            JUSTIFY:5
        }

    },
    extendsWith : function() {

        return {

            /**
             * @lends CAAT.Foundation.UI.Layout.LayoutManager.prototype
             */


            __init : function( ) {

                this.newChildren= [];
                this.padding= {
                    left:   2,
                    right:  2,
                    top:    2,
                    bottom: 2
                };

                return this;
            },

            /**
             * If animation enabled, new element interpolator.
             */
            newElementInterpolator : new CAAT.Behavior.Interpolator().createElasticOutInterpolator(1.1,.7),

            /**
             * If animation enabled, relayout elements interpolator.
             */
            moveElementInterpolator : new CAAT.Behavior.Interpolator().createExponentialOutInterpolator(2),

            /**
             * Defines insets:
             * @type {{ left, right, top, botton }}
             */
            padding : null,

            /**
             * Needs relayout ??
             */
            invalid : true,

            /**
             * Horizontal gap between children.
             */
            hgap        : 2,

            /**
             * Vertical gap between children.
             */
            vgap        : 2,

            /**
             * Animate on adding/removing elements.
             */
            animated    : false,

            /**
             * pending to be laid-out actors.
             */
            newChildren : null,

            setAnimated : function( animate ) {
                this.animated= animate;
                return this;
            },

            setHGap : function( gap ) {
                this.hgap= gap;
                this.invalidateLayout();
                return this;
            },

            setVGap : function( gap ) {
                this.vgap= gap;
                this.invalidateLayout();
                return this;
            },

            setAllPadding : function( s ) {
                this.padding.left= s;
                this.padding.right= s;
                this.padding.top= s;
                this.padding.bottom= s;
                this.invalidateLayout();
                return this;
            },

            setPadding : function( l,r, t,b ) {
                this.padding.left= l;
                this.padding.right= r;
                this.padding.top= t;
                this.padding.bottom= b;
                this.invalidateLayout();
                return this;
            },

            addChild : function( child, constraints ) {
                this.newChildren.push( child );
            },

            removeChild : function( child ) {

            },

            doLayout : function( container ) {
                this.newChildren= [];
                this.invalid= false;
            },

            invalidateLayout : function( container ) {
                this.invalid= true;
            },

            getMinimumLayoutSize : function( container ) {

            },

            getPreferredLayoutSize : function(container ) {

            },

            isValid : function() {
                return !this.invalid;
            },

            isInvalidated : function() {
                return this.invalid;
            }
        }
    }
});
CAAT.Module({

    /**
     * @name BoxLayout
     * @memberOf CAAT.Foundation.UI.Layout
     * @extends CAAT.Foundation.UI.Layout.LayoutManager
     * @constructor
     */

    defines:"CAAT.Foundation.UI.Layout.BoxLayout",
    aliases:["CAAT.UI.BoxLayout"],
    depends:[
        "CAAT.Foundation.UI.Layout.LayoutManager",
        "CAAT.Math.Dimension"
    ],
    extendsClass:"CAAT.Foundation.UI.Layout.LayoutManager",
    extendsWith:function () {

        return {

            /**
             * @lends CAAT.Foundation.UI.Layout.BoxLayout.prototype
             */

            /**
             * Stack elements in this axis.
             * @type {CAAT.Foundation.UI.Layout.LayoutManager}
             */
            axis:CAAT.Foundation.UI.Layout.LayoutManager.AXIS.Y,

            /**
             * Vertical alignment.
             * @type {CAAT.Foundation.UI.Layout.LayoutManager.ALIGNMENT}
             */
            valign:CAAT.Foundation.UI.Layout.LayoutManager.ALIGNMENT.CENTER,

            /**
             * Horizontal alignment.
             * @type {CAAT.Foundation.UI.Layout.LayoutManager.ALIGNMENT}
             */
            halign:CAAT.Foundation.UI.Layout.LayoutManager.ALIGNMENT.CENTER,

            setAxis:function (axis) {
                this.axis = axis;
                this.invalidateLayout();
                return this;
            },

            setHorizontalAlignment:function (align) {
                this.halign = align;
                this.invalidateLayout();
                return this;
            },

            setVerticalAlignment:function (align) {
                this.valign = align;
                this.invalidateLayout();
                return this;
            },

            doLayout:function (container) {

                if (this.axis === CAAT.Foundation.UI.Layout.LayoutManager.AXIS.Y) {
                    this.doLayoutVertical(container);
                } else {
                    this.doLayoutHorizontal(container);
                }

                CAAT.Foundation.UI.Layout.BoxLayout.superclass.doLayout.call(this, container);
            },

            doLayoutHorizontal:function (container) {

                var computedW = 0, computedH = 0;
                var yoffset = 0, xoffset;
                var i, l, actor;

                // calculamos ancho y alto de los elementos.
                for (i = 0, l = container.getNumChildren(); i < l; i += 1) {

                    actor = container.getChildAt(i);
                    if (!actor.preventLayout && actor.isVisible() && actor.isInAnimationFrame(CAAT.getCurrentSceneTime())) {
                        if (computedH < actor.height) {
                            computedH = actor.height;
                        }

                        computedW += actor.width;
                        if (i > 0) {
                            computedW += this.hgap;
                        }
                    }
                }

                switch (this.halign) {
                    case CAAT.Foundation.UI.Layout.LayoutManager.ALIGNMENT.LEFT:
                        xoffset = this.padding.left;
                        break;
                    case CAAT.Foundation.UI.Layout.LayoutManager.ALIGNMENT.RIGHT:
                        xoffset = container.width - computedW - this.padding.right;
                        break;
                    default:
                        xoffset = (container.width - computedW) / 2;
                }

                for (i = 0, l = container.getNumChildren(); i < l; i += 1) {
                    actor = container.getChildAt(i);
                    if (!actor.preventLayout && actor.isVisible() && actor.isInAnimationFrame(CAAT.getCurrentSceneTime())) {
                        switch (this.valign) {
                            case CAAT.Foundation.UI.Layout.LayoutManager.ALIGNMENT.TOP:
                                yoffset = this.padding.top;
                                break;
                            case CAAT.Foundation.UI.Layout.LayoutManager.ALIGNMENT.BOTTOM:
                                yoffset = container.height - this.padding.bottom - actor.height;
                                break;
                            default:
                                yoffset = (container.height - actor.height) / 2;
                        }

                        this.__setActorPosition(actor, xoffset, yoffset);

                        xoffset += actor.width + this.hgap;
                    }
                }

            },

            __setActorPosition:function (actor, xoffset, yoffset) {
                if (this.animated) {
                    if (this.newChildren.indexOf(actor) !== -1) {
                        actor.setPosition(xoffset, yoffset);
                        actor.setScale(0, 0);
                        actor.scaleTo(1, 1, 500, 0, .5, .5, this.newElementInterpolator);
                    } else {
                        actor.moveTo(xoffset, yoffset, 500, 0, this.moveElementInterpolator);
                    }
                } else {
                    actor.setPosition(xoffset, yoffset);
                }
            },

            doLayoutVertical:function (container) {

                var computedW = 0, computedH = 0;
                var yoffset, xoffset;
                var i, l, actor;

                // calculamos ancho y alto de los elementos.
                for (i = 0, l = container.getNumChildren(); i < l; i += 1) {

                    actor = container.getChildAt(i);
                    if (!actor.preventLayout && actor.isVisible() && actor.isInAnimationFrame(CAAT.getCurrentSceneTime())) {
                        if (computedW < actor.width) {
                            computedW = actor.width;
                        }

                        computedH += actor.height;
                        if (i > 0) {
                            computedH += this.vgap;
                        }
                    }
                }

                switch (this.valign) {
                    case CAAT.Foundation.UI.Layout.LayoutManager.ALIGNMENT.TOP:
                        yoffset = this.padding.top;
                        break;
                    case CAAT.Foundation.UI.Layout.LayoutManager.ALIGNMENT.BOTTOM:
                        yoffset = container.height - computedH - this.padding.bottom;
                        break;
                    default:
                        yoffset = (container.height - computedH) / 2;
                }

                for (i = 0, l = container.getNumChildren(); i < l; i += 1) {
                    actor = container.getChildAt(i);
                    if (!actor.preventLayout && actor.isVisible() && actor.isInAnimationFrame(CAAT.getCurrentSceneTime())) {
                        switch (this.halign) {
                            case CAAT.Foundation.UI.Layout.LayoutManager.ALIGNMENT.LEFT:
                                xoffset = this.padding.left;
                                break;
                            case CAAT.Foundation.UI.Layout.LayoutManager.ALIGNMENT.RIGHT:
                                xoffset = container.width - this.padding.right - actor.width;
                                break;
                            default:
                                xoffset = (container.width - actor.width) / 2;
                        }

                        this.__setActorPosition(actor, xoffset, yoffset);

                        yoffset += actor.height + this.vgap;
                    }
                }
            },

            getPreferredLayoutSize:function (container) {

                var dim = new CAAT.Math.Dimension();
                var computedW = 0, computedH = 0;
                var i, l;

                // calculamos ancho y alto de los elementos.
                for (i = 0, l = container.getNumChildren(); i < l; i += 1) {

                    var actor = container.getChildAt(i);
                    if (!actor.preventLayout && actor.isVisible() && actor.isInAnimationFrame(CAAT.getCurrentSceneTime())) {
                        var ps = actor.getPreferredSize();

                        if (computedH < ps.height) {
                            computedH = ps.height;
                        }
                        computedW += ps.width;
                    }
                }

                dim.width = computedW;
                dim.height = computedH;

                return dim;
            },

            getMinimumLayoutSize:function (container) {
                var dim = new CAAT.Math.Dimension();
                var computedW = 0, computedH = 0;
                var i, l;

                // calculamos ancho y alto de los elementos.
                for (i = 0, l = container.getNumChildren(); i < l; i += 1) {

                    var actor = container.getChildAt(i);
                    if (!actor.preventLayout && actor.isVisible() && actor.isInAnimationFrame(CAAT.getCurrentSceneTime())) {
                        var ps = actor.getMinimumSize();

                        if (computedH < ps.height) {
                            computedH = ps.height;
                        }
                        computedW += ps.width;
                    }
                }

                dim.width = computedW;
                dim.height = computedH;

                return dim;
            }
        }
    }
});
CAAT.Module( {

    /**
     * @name BorderLayout
     * @memberOf CAAT.Foundation.UI.Layout
     * @extends CAAT.Foundation.UI.Layout.LayoutManager
     * @constructor
     */

    defines : "CAAT.Foundation.UI.Layout.BorderLayout",
    aliases : ["CAAT.UI.BorderLayout"],
    depends : [
        "CAAT.Foundation.UI.Layout.LayoutManager",
        "CAAT.Math.Dimension"
    ],
    extendsClass : "CAAT.Foundation.UI.Layout.LayoutManager",
    extendsWith : {

        /**
         * @lends CAAT.Foundation.UI.Layout.BorderLayout.prototype
         */


        __init : function() {
            this.__super();
            return this;
        },

        /**
         * An actor to position left.
         */
        left    : null,

        /**
         * An actor to position right.
         */
        right   : null,

        /**
         * An actor to position top.
         */
        top     : null,

        /**
         * An actor to position botton.
         */
        bottom  : null,

        /**
         * An actor to position center.
         */
        center  : null,

        addChild : function( child, constraint ) {

            if ( typeof constraint==="undefined" ) {
                constraint="center";
            }

            CAAT.Foundation.UI.Layout.BorderLayout.superclass.addChild.call( this, child, constraint );

            if ( constraint==="left" ) {
                this.left= child;
            } else if ( constraint==="right" ) {
                this.right= child;
            } else if ( constraint==="top" ) {
                this.top= child;
            } else if ( constraint==="bottom" ) {
                this.bottom= child;
            } else {
                //"center"
                this.center= child;
            }
        },

        removeChild : function( child ) {
            if ( this.center===child ) {
                this.center=null;
            } else if ( this.left===child ) {
                this.left= null;
            } else if ( this.right===child ) {
                this.right= null;
            } else if ( this.top===child ) {
                this.top= null;
            } else if ( this.bottom===child ) {
                this.bottom= null;
            }
        },

        __getChild : function( constraint ) {
            if ( constraint==="center" ) {
                return this.center;
            } else if ( constraint==="left" ) {
                return this.left;
            } else if ( constraint==="right" ) {
                return this.right;
            } else if ( constraint==="top" ) {
                return this.top;
            } else if ( constraint==="bottom" ) {
                return this.bottom;
            }
        },

        getMinimumLayoutSize : function( container ) {
            var c, d;
            var dim= new CAAT.Math.Dimension();

            if ((c=this.__getChild("right")) != null) {
                d = c.getMinimumSize();
                dim.width += d.width + this.hgap;
                dim.height = Math.max(d.height, dim.height);
            }
            if ((c=this.__getChild("left")) != null) {
                d = c.getMinimumSize();
                dim.width += d.width + this.hgap;
                dim.height = Math.max(d.height, dim.height);
            }
            if ((c=this.__getChild("center")) != null) {
                d = c.getMinimumSize();
                dim.width += d.width;
                dim.height = Math.max(d.height, dim.height);
            }
            if ((c=this.__getChild("top")) != null) {
                d = c.getMinimumSize();
                dim.width = Math.max(d.width, dim.width);
                dim.height += d.height + this.vgap;
            }
            if ((c=this.__getChild("bottom")) != null) {
                d = c.getMinimumSize();
                dim.width = Math.max(d.width, dim.width);
                dim.height += d.height + this.vgap;
            }

            dim.width += this.padding.left + this.padding.right;
            dim.height += this.padding.top + this.padding.bottom;

            return dim;
        },

        getPreferredLayoutSize : function( container ) {
            var c, d;
            var dim= new CAAT.Dimension();

            if ((c=this.__getChild("left")) != null) {
                d = c.getPreferredSize();
                dim.width += d.width + this.hgap;
                dim.height = Math.max(d.height, dim.height);
            }
            if ((c=this.__getChild("right")) != null) {
                d = c.getPreferredSize();
                dim.width += d.width + this.hgap;
                dim.height = Math.max(d.height, dim.height);
            }
            if ((c=this.__getChild("center")) != null) {
                d = c.getPreferredSize();
                dim.width += d.width;
                dim.height = Math.max(d.height, dim.height);
            }
            if ((c=this.__getChild("top")) != null) {
                d = c.getPreferredSize();
                dim.width = Math.max(d.width, dim.width);
                dim.height += d.height + this.vgap;
            }
            if ((c=this.__getChild("bottom")) != null) {
                d = c.getPreferredSize();
                dim.width = Math.max(d.width, dim.width);
                dim.height += d.height + this.vgap;
            }

            dim.width += this.padding.left + this.padding.right;
            dim.height += this.padding.top + this.padding.bottom;

            return dim;
        },

        doLayout : function( container ) {

            var top = this.padding.top;
            var bottom = container.height - this.padding.bottom;
            var left = this.padding.left;
            var right = container.width - this.padding.right;
            var c, d;

            if ((c=this.__getChild("top")) != null) {
                c.setSize(right - left, c.height);
                d = c.getPreferredSize();
                c.setBounds(left, top, right - left, d.height);
                top += d.height + this.vgap;
            }
            if ((c=this.__getChild("bottom")) != null) {
                c.setSize(right - left, c.height);
                d = c.getPreferredSize();
                c.setBounds(left, bottom - d.height, right - left, d.height);
                bottom -= d.height + this.vgap;
            }
            if ((c=this.__getChild("right")) != null) {
                c.setSize(c.width, bottom - top);
                d = c.getPreferredSize();
                c.setBounds(right - d.width, top, d.width, bottom - top);
                right -= d.width + this.hgap;
            }
            if ((c=this.__getChild("left")) != null) {
                c.setSize(c.width, bottom - top);
                d = c.getPreferredSize();
                c.setBounds(left, top, d.width, bottom - top);
                left += d.width + this.hgap;
            }
            if ((c=this.__getChild("center")) != null) {
                c.setBounds(left, top, right - left, bottom - top);
            }

            CAAT.Foundation.UI.Layout.BorderLayout.superclass.doLayout.call(this, container);
        }


    }

});
CAAT.Module( {

    /**
     * @name GridLayout
     * @memberOf CAAT.Foundation.UI.Layout
     * @extends CAAT.Foundation.UI.Layout.LayoutManager
     * @constructor
     */

    defines : "CAAT.Foundation.UI.Layout.GridLayout",
    aliases : ["CAAT.UI.GridLayout"],
    depends : [
        "CAAT.Foundation.UI.Layout.LayoutManager",
        "CAAT.Math.Dimension"
    ],
    extendsClass : "CAAT.Foundation.UI.Layout.LayoutManager",
    extendsWith : {

        /**
         * @lends CAAT.Foundation.UI.Layout.GridLayout.prototype
         */

        __init : function( rows, columns ) {
            this.__super();
            this.rows= rows;
            this.columns= columns;

            return this;
        },

        /**
         * Layout elements using this number of rows.
         */
        rows    : 0,

        /**
         * Layout elements using this number of columns.
         */
        columns : 2,

        doLayout : function( container ) {

            var actors= [];
            for( var i=0; i<container.getNumChildren(); i++ ) {
                var child= container.getChildAt(i);
                if (!child.preventLayout && child.isVisible() && child.isInAnimationFrame( CAAT.getCurrentSceneTime()) ) {
                    actors.push(child);
                }
            }
            var nactors= actors.length;

            if (nactors.length=== 0) {
                return;
            }

            var nrows = this.rows;
            var ncols = this.columns;

            if (nrows > 0) {
                ncols = Math.floor( (nactors + nrows - 1) / nrows );
            } else {
                nrows = Math.floor( (nactors + ncols - 1) / ncols );
            }

            var totalGapsWidth = (ncols - 1) * this.hgap;
            var widthWOInsets = container.width - (this.padding.left + this.padding.right);
            var widthOnComponent = Math.floor( (widthWOInsets - totalGapsWidth) / ncols );
            var extraWidthAvailable = Math.floor( (widthWOInsets - (widthOnComponent * ncols + totalGapsWidth)) / 2 );

            var totalGapsHeight = (nrows - 1) * this.vgap;
            var heightWOInsets = container.height - (this.padding.top + this.padding.bottom);
            var heightOnComponent = Math.floor( (heightWOInsets - totalGapsHeight) / nrows );
            var extraHeightAvailable = Math.floor( (heightWOInsets - (heightOnComponent * nrows + totalGapsHeight)) / 2 );

            for (var c = 0, x = this.padding.left + extraWidthAvailable; c < ncols ; c++, x += widthOnComponent + this.hgap) {
                for (var r = 0, y = this.padding.top + extraHeightAvailable; r < nrows ; r++, y += heightOnComponent + this.vgap) {
                    var i = r * ncols + c;
                    if (i < actors.length) {
                        var child= actors[i];
                        if ( !child.preventLayout && child.isVisible() && child.isInAnimationFrame( CAAT.getCurrentSceneTime() ) ) {
                            if ( !this.animated ) {
                                child.setBounds(
                                    x + (widthOnComponent-child.width)/2,
                                    y,
                                    widthOnComponent,
                                    heightOnComponent);
                            } else {
                                if ( child.width!==widthOnComponent || child.height!==heightOnComponent ) {
                                    child.setSize(widthOnComponent, heightOnComponent);
                                    if ( this.newChildren.indexOf( child ) !==-1 ) {
                                        child.setPosition(
                                            x + (widthOnComponent-child.width)/2,
                                            y );
                                        child.setScale(0.01,0.01);
                                        child.scaleTo( 1,1, 500, 0,.5,.5, this.newElementInterpolator );
                                    } else {
                                        child.moveTo(
                                            x + (widthOnComponent-child.width)/2,
                                            y,
                                            500,
                                            0,
                                            this.moveElementInterpolator );
                                    }
                                }
                            }
                        }
                    }
                }
            }

            CAAT.Foundation.UI.Layout.GridLayout.superclass.doLayout.call(this, container);
        },

        getMinimumLayoutSize : function( container ) {
            var nrows = this.rows;
            var ncols = this.columns;
            var nchildren= container.getNumChildren();
            var w=0, h=0, i;

            if (nrows > 0) {
                ncols = Math.ceil( (nchildren + nrows - 1) / nrows );
            } else {
                nrows = Math.ceil( (nchildren + ncols - 1) / ncols );
            }

            for ( i= 0; i < nchildren; i+=1 ) {
                var actor= container.getChildAt(i);
                if ( !actor.preventLayout && actor.isVisible() && actor.isInAnimationFrame( CAAT.getCurrentSceneTime() ) ) {
                    var d = actor.getMinimumSize();
                    if (w < d.width) {
                        w = d.width;
                    }
                    if (h < d.height) {
                        h = d.height;
                    }
                }
            }

            return new CAAT.Math.Dimension(
                this.padding.left + this.padding.right + ncols * w + (ncols - 1) * this.hgap,
                this.padding.top + this.padding.bottom + nrows * h + (nrows - 1) * this.vgap
            );
        },

        getPreferredLayoutSize : function( container ) {

            var nrows = this.rows;
            var ncols = this.columns;
            var nchildren= container.getNumChildren();
            var w=0, h=0, i;

            if (nrows > 0) {
                ncols = Math.ceil( (nchildren + nrows - 1) / nrows );
            } else {
                nrows = Math.ceil( (nchildren + ncols - 1) / ncols );
            }

            for ( i= 0; i < nchildren; i+=1 ) {
                var actor= container.getChildAt(i);
                if ( !actor.preventLayout && actor.isVisible() && actor.isInAnimationFrame( CAAT.getCurrentSceneTime() ) ) {
                    var d = actor.getPreferredSize();
                    if (w < d.width) {
                        w = d.width;
                    }
                    if (h < d.height) {
                        h = d.height;
                    }
                }
            }

            return new CAAT.Math.Dimension(
                this.padding.left + this.padding.right + ncols * w + (ncols - 1) * this.hgap,
                this.padding.top + this.padding.bottom + nrows * h + (nrows - 1) * this.vgap
            );
        }

    }
});
CAAT.Module( {

    /**
     * Define a drawable sub-image inside a bigger image as an independant drawable item.
     *
     * @name SpriteImageHelper
     * @memberOf CAAT.Foundation
     * @constructor
     *
     *
     *
     */


    defines : "CAAT.Foundation.SpriteImageHelper",

    extendsWith : {

        /**
         * @lends  CAAT.Foundation.SpriteImageHelper.prototype
         */

        __init : function (x, y, w, h, iw, ih) {
            this.x = parseFloat(x);
            this.y = parseFloat(y);
            this.width = parseFloat(w);
            this.height = parseFloat(h);

            this.setGL(x / iw, y / ih, (x + w - 1) / iw, (y + h - 1) / ih);
            return this;
        },

        x:0,
        y:0,
        width:0,
        height:0,
        u:0,
        v:0,
        u1:0,
        v1:0,

        setGL:function (u, v, u1, v1) {
            this.u = u;
            this.v = v;
            this.u1 = u1;
            this.v1 = v1;
            return this;
        }
    }
});
CAAT.Module({

    /**
     *
     * Define an animation frame sequence, name it and supply with a callback which be called when the
     * sequence ends playing.
     *
     * @name SpriteImageAnimationHelper
     * @memberOf CAAT.Foundation
     * @constructor
     */

    defines : "CAAT.Foundation.SpriteImageAnimationHelper",
    extendsWith : function() {
        return {

            /**
             * @lends  CAAT.Foundation.SpriteImageAnimationHelper.prototype
             */

            __init : function( animation, time, onEndPlayCallback ) {
                this.animation= animation;
                this.time= time;
                this.onEndPlayCallback= onEndPlayCallback;
                return this;
            },

            /**
             * A sequence of integer values defining a frame animation.
             * For example [1,2,3,4,3,2,3,4,3,2]
             * Array.<number>
             */
            animation :         null,

            /**
             * Time between any two animation frames.
             */
            time :              0,

            /**
             * Call this callback function when the sequence ends.
             */
            onEndPlayCallback : null

        }
    }
});/**
 * See LICENSE file.
 *
 * TODO: allow set of margins, spacing, etc. to define subimages.
 *
 **/

CAAT.Module({

    /**
     * @name SpriteImage
     * @memberOf CAAT.Foundation
     * @constructor
     */


    defines : "CAAT.Foundation.SpriteImage",
    aliases : ["CAAT.SpriteImage"],
    depends : [
        "CAAT.Foundation.SpriteImageHelper",
        "CAAT.Foundation.SpriteImageAnimationHelper",
        "CAAT.Math.Rectangle"
    ],
    constants:{
        /**
         * @lends  CAAT.Foundation.SpriteImage
         */

        /** @const @type {number} */ TR_NONE:0, // constants used to determine how to draw the sprite image,
        /** @const @type {number} */ TR_FLIP_HORIZONTAL:1,
        /** @const @type {number} */ TR_FLIP_VERTICAL:2,
        /** @const @type {number} */ TR_FLIP_ALL:3,
        /** @const @type {number} */ TR_FIXED_TO_SIZE:4,
        /** @const @type {number} */ TR_FIXED_WIDTH_TO_SIZE:6,
        /** @const @type {number} */ TR_TILE:5
    },
    extendsWith:function () {

        return {

            /**
             * @lends  CAAT.Foundation.SpriteImage.prototype
             */

            __init:function () {
                this.paint = this.paintN;
                this.setAnimationImageIndex([0]);
                this.mapInfo = {};
                this.animationsMap= {};

                if ( arguments.length===1 ) {
                    this.initialize.call(this, arguments[0], 1, 1);
                } else if ( arguments.length===3 ) {
                    this.initialize.apply(this, arguments);
                }
                return this;
            },

            /**
             * an Array defining the sprite frame sequence
             */
            animationImageIndex:null,

            /**
             * Previous animation frame time.
             */
            prevAnimationTime:-1,

            /**
             * how much Scene time to take before changing an Sprite frame.
             */
            changeFPS:1000,

            /**
             * any of the TR_* constants.
             */
            transformation:0,

            /**
             * the current sprite frame
             */
            spriteIndex:0,

            /**
             * current index of sprite frames array.
             */
            prevIndex:0,    //

            /**
             * current animation name
             */
            currentAnimation: null,

            /**
             * Image to get frames from.
             */
            image:null,

            /**
             * Number of rows
             */
            rows:1,

            /**
             * Number of columns.
             */
            columns:1,

            /**
             * This sprite image image´s width
             */
            width:0,

            /**
             * This sprite image image´s width
             */
            height:0,

            /**
             * For each element in the sprite image array, its size.
             */
            singleWidth:0,

            /**
             * For each element in the sprite image array, its height.
             */
            singleHeight:0,

            scaleX:1,
            scaleY:1,

            /**
             * Displacement offset to get the sub image from. Useful to make images shift.
             */
            offsetX:0,

            /**
             * Displacement offset to get the sub image from. Useful to make images shift.
             */
            offsetY:0,

            /**
             * When nesting sprite images, this value is the star X position of this sprite image in the parent.
             */
            parentOffsetX:0,    // para especificar una subimagen dentro un textmap.

            /**
             * When nesting sprite images, this value is the star Y position of this sprite image in the parent.
             */
            parentOffsetY:0,

            /**
             * The actor this sprite image belongs to.
             */
            ownerActor:null,

            /**
             * If the sprite image is defined out of a JSON object (sprite packer for example), this is
             * the subimages calculated definition map.
             */
            mapInfo:null,

            /**
             * If the sprite image is defined out of a JSON object (sprite packer for example), this is
             * the subimages original definition map.
             */
            map:null,

            /**
             * This property allows to have multiple different animations defined for one actor.
             * see demo31 for a sample.
             */
            animationsMap : null,

            /**
             * When an animation sequence ends, this callback function will be called.
             */
            callback : null,        // on end animation callback

            /**
             * pending: refactor -> font scale to a font object.
             */
            fontScale : 1,

            getOwnerActor : function() {
                return this.ownerActor;
            },

            /**
             * Add an animation to this sprite image.
             * An animation is defines by an array of pretend-to-be-played sprite sequence.
             *
             * @param name {string} animation name.
             * @param array {Array<number|string>} the sprite animation sequence array. It can be defined
             *              as number array for Grid-like sprite images or strings for a map-like sprite
             *              image.
             * @param time {number} change animation sequence every 'time' ms.
             * @param callback {function({SpriteImage},{string}} a callback function to invoke when the sprite
             *              animation sequence has ended.
             */
            addAnimation : function( name, array, time, callback ) {
                this.animationsMap[name]= new CAAT.Foundation.SpriteImageAnimationHelper(array,time,callback);
                return this;
            },

            setAnimationEndCallback : function(f) {
                this.callback= f;
            },

            /**
             * Start playing a SpriteImage animation.
             * If it does not exist, nothing happens.
             * @param name
             */
            playAnimation : function(name) {
                if (name===this.currentAnimation) {
                    return this;
                }

                var animation= this.animationsMap[name];
                if ( !animation ) {
                    return this;
                }

                this.currentAnimation= name;

                this.setAnimationImageIndex( animation.animation );
                this.changeFPS= animation.time;
                this.callback= animation.onEndPlayCallback;

                return this;
            },

            setOwner:function (actor) {
                this.ownerActor = actor;
                return this;
            },
            getRows:function () {
                return this.rows;
            },
            getColumns:function () {
                return this.columns;
            },

            getWidth:function () {
                var el = this.mapInfo[this.spriteIndex];
                return el.width;
            },

            getHeight:function () {
                var el = this.mapInfo[this.spriteIndex];
                return el.height;
            },

            getWrappedImageWidth:function () {
                return this.image.width;
            },

            getWrappedImageHeight:function () {
                return this.image.height;
            },

            /**
             * Get a reference to the same image information (rows, columns, image and uv cache) of this
             * SpriteImage. This means that re-initializing this objects image info (that is, calling initialize
             * method) will change all reference's image information at the same time.
             */
            getRef:function () {
                var ret = new CAAT.Foundation.SpriteImage();
                ret.image = this.image;
                ret.rows = this.rows;
                ret.columns = this.columns;
                ret.width = this.width;
                ret.height = this.height;
                ret.singleWidth = this.singleWidth;
                ret.singleHeight = this.singleHeight;
                ret.mapInfo = this.mapInfo;
                ret.offsetX = this.offsetX;
                ret.offsetY = this.offsetY;
                ret.scaleX = this.scaleX;
                ret.scaleY = this.scaleY;
                ret.animationsMap= this.animationsMap;
                ret.parentOffsetX= this.parentOffsetX;
                ret.parentOffsetY= this.parentOffsetY;

                ret.scaleFont= this.scaleFont;

                return ret;
            },
            /**
             * Set horizontal displacement to draw image. Positive values means drawing the image more to the
             * right.
             * @param x {number}
             * @return this
             */
            setOffsetX:function (x) {
                this.offsetX = x;
                return this;
            },
            /**
             * Set vertical displacement to draw image. Positive values means drawing the image more to the
             * bottom.
             * @param y {number}
             * @return this
             */
            setOffsetY:function (y) {
                this.offsetY = y;
                return this;
            },
            setOffset:function (x, y) {
                this.offsetX = x;
                this.offsetY = y;
                return this;
            },
            /**
             * Initialize a grid of subimages out of a given image.
             * @param image {HTMLImageElement|Image} an image object.
             * @param rows {number} number of rows.
             * @param columns {number} number of columns
             *
             * @return this
             */
            initialize:function (image, rows, columns) {

                if (!image) {
                    console.log("Null image for SpriteImage.");
                }

                if ( isString(image) ) {
                    image= CAAT.currentDirector.getImage(image);
                }

                this.parentOffsetX= 0;
                this.parentOffsetY= 0;

                this.rows = rows;
                this.columns = columns;

                if ( image instanceof CAAT.Foundation.SpriteImage || image instanceof CAAT.SpriteImage ) {
                    this.image =        image.image;
                    var sihelper= image.mapInfo[0];
                    this.width= sihelper.width;
                    this.height= sihelper.height;

                    this.parentOffsetX= sihelper.x;
                    this.parentOffsetY= sihelper.y;

                    this.width= image.mapInfo[0].width;
                    this.height= image.mapInfo[0].height;

                } else {
                    this.image = image;
                    this.width = image.width;
                    this.height = image.height;
                    this.mapInfo = {};

                }

                this.singleWidth = Math.floor(this.width / columns);
                this.singleHeight = Math.floor(this.height / rows);

                var i, sx0, sy0;
                var helper;

                if (image.__texturePage) {
                    image.__du = this.singleWidth / image.__texturePage.width;
                    image.__dv = this.singleHeight / image.__texturePage.height;


                    var w = this.singleWidth;
                    var h = this.singleHeight;
                    var mod = this.columns;
                    if (image.inverted) {
                        var t = w;
                        w = h;
                        h = t;
                        mod = this.rows;
                    }

                    var xt = this.image.__tx;
                    var yt = this.image.__ty;

                    var tp = this.image.__texturePage;

                    for (i = 0; i < rows * columns; i++) {


                        var c = ((i % mod) >> 0);
                        var r = ((i / mod) >> 0);

                        var u = xt + c * w;  // esquina izq x
                        var v = yt + r * h;

                        var u1 = u + w;
                        var v1 = v + h;

                        helper = new CAAT.Foundation.SpriteImageHelper(u, v, (u1 - u), (v1 - v), tp.width, tp.height).setGL(
                            u / tp.width,
                            v / tp.height,
                            u1 / tp.width,
                            v1 / tp.height);

                        this.mapInfo[i] = helper;
                    }

                } else {
                    for (i = 0; i < rows * columns; i++) {
                        sx0 = ((i % this.columns) | 0) * this.singleWidth + this.parentOffsetX;
                        sy0 = ((i / this.columns) | 0) * this.singleHeight + this.parentOffsetY;

                        helper = new CAAT.Foundation.SpriteImageHelper(sx0, sy0, this.singleWidth, this.singleHeight, image.width, image.height);
                        this.mapInfo[i] = helper;
                    }
                }

                return this;
            },

            /**
             * Create elements as director.getImage values.
             * Create as much as elements defined in this sprite image.
             * The elements will be named prefix+<the map info element name>
             * @param prefix
             */
            addElementsAsImages : function( prefix ) {
                for( var i in this.mapInfo ) {
                    var si= new CAAT.Foundation.SpriteImage().initialize( this.image, 1, 1 );
                    si.addElement(0, this.mapInfo[i]);
                    si.setSpriteIndex(0);
                    CAAT.currentDirector.addImage( prefix+i, si );
                }
            },

            copy : function( other ) {
                this.initialize(other,1,1);
                this.mapInfo= other.mapInfo;
                return this;
            },

            /**
             * Must be used to draw actor background and the actor should have setClip(true) so that the image tiles
             * properly.
             * @param director
             * @param time
             * @param x
             * @param y
             */
            paintTiled:function (director, time, x, y) {

                // PENDING: study using a pattern

                var el = this.mapInfo[this.spriteIndex];

                var r = new CAAT.Math.Rectangle();
                this.ownerActor.AABB.intersect(director.AABB, r);

                var w = this.getWidth();
                var h = this.getHeight();
                var xoff = (this.offsetX - this.ownerActor.x) % w;
                if (xoff > 0) {
                    xoff = xoff - w;
                }
                var yoff = (this.offsetY - this.ownerActor.y) % h;
                if (yoff > 0) {
                    yoff = yoff - h;
                }

                var nw = (((r.width - xoff) / w) >> 0) + 1;
                var nh = (((r.height - yoff) / h) >> 0) + 1;
                var i, j;
                var ctx = director.ctx;

                for (i = 0; i < nh; i++) {
                    for (j = 0; j < nw; j++) {
                        ctx.drawImage(
                            this.image,
                            el.x, el.y,
                            el.width, el.height,
                            (r.x - this.ownerActor.x + xoff + j * el.width) >> 0, (r.y - this.ownerActor.y + yoff + i * el.height) >> 0,
                            el.width, el.height);
                    }
                }
            },

            /**
             * Draws the subimage pointed by imageIndex horizontally inverted.
             * @param director {CAAT.Foundation.Director}
             * @param time {number} scene time.
             * @param x {number} x position in canvas to draw the image.
             * @param y {number} y position in canvas to draw the image.
             *
             * @return this
             */
            paintInvertedH:function (director, time, x, y) {

                var el = this.mapInfo[this.spriteIndex];

                var ctx = director.ctx;
                ctx.save();
                //ctx.translate(((0.5 + x) | 0) + el.width, (0.5 + y) | 0);
                ctx.translate((x | 0) + el.width, y | 0);
                ctx.scale(-1, 1);


                ctx.drawImage(
                    this.image,
                    el.x, el.y,
                    el.width, el.height,
                    this.offsetX >> 0, this.offsetY >> 0,
                    el.width, el.height);

                ctx.restore();

                return this;
            },
            /**
             * Draws the subimage pointed by imageIndex vertically inverted.
             * @param director {CAAT.Foundation.Director}
             * @param time {number} scene time.
             * @param x {number} x position in canvas to draw the image.
             * @param y {number} y position in canvas to draw the image.
             *
             * @return this
             */
            paintInvertedV:function (director, time, x, y) {

                var el = this.mapInfo[this.spriteIndex];

                var ctx = director.ctx;
                ctx.save();
                //ctx.translate((x + 0.5) | 0, (0.5 + y + el.height) | 0);
                ctx.translate(x | 0, (y + el.height) | 0);
                ctx.scale(1, -1);

                ctx.drawImage(
                    this.image,
                    el.x, el.y,
                    el.width, el.height,
                    this.offsetX >> 0, this.offsetY >> 0,
                    el.width, el.height);

                ctx.restore();

                return this;
            },
            /**
             * Draws the subimage pointed by imageIndex both horizontal and vertically inverted.
             * @param director {CAAT.Foundation.Director}
             * @param time {number} scene time.
             * @param x {number} x position in canvas to draw the image.
             * @param y {number} y position in canvas to draw the image.
             *
             * @return this
             */
            paintInvertedHV:function (director, time, x, y) {

                var el = this.mapInfo[this.spriteIndex];

                var ctx = director.ctx;
                ctx.save();
                //ctx.translate((x + 0.5) | 0, (0.5 + y + el.height) | 0);
                ctx.translate(x | 0, (y + el.height) | 0);
                ctx.scale(1, -1);
                ctx.translate(el.width, 0);
                ctx.scale(-1, 1);

                ctx.drawImage(
                    this.image,
                    el.x, el.y,
                    el.width, el.height,
                    this.offsetX >> 0, this.offsetY >> 0,
                    el.width, el.height);

                ctx.restore();

                return this;
            },
            /**
             * Draws the subimage pointed by imageIndex.
             * @param director {CAAT.Foundation.Director}
             * @param time {number} scene time.
             * @param x {number} x position in canvas to draw the image.
             * @param y {number} y position in canvas to draw the image.
             *
             * @return this
             */
            paintN:function (director, time, x, y) {

                var el = this.mapInfo[this.spriteIndex];

                director.ctx.drawImage(
                    this.image,
                    el.x, el.y,
                    el.width, el.height,
                    (this.offsetX + x) >> 0, (this.offsetY + y) >> 0,
                    el.width, el.height);

                return this;
            },
            paintAtRect:function (director, time, x, y, w, h) {

                var el = this.mapInfo[this.spriteIndex];

                director.ctx.drawImage(
                    this.image,
                    el.x, el.y,
                    el.width, el.height,
                    (this.offsetX + x) >> 0, (this.offsetY + y) >> 0,
                    w, h);

                return this;
            },
            /**
             * Draws the subimage pointed by imageIndex.
             * @param director {CAAT.Foundation.Director}
             * @param time {number} scene time.
             * @param x {number} x position in canvas to draw the image.
             * @param y {number} y position in canvas to draw the image.
             *
             * @return this
             */
            paintScaledWidth:function (director, time, x, y) {

                var el = this.mapInfo[this.spriteIndex];

                director.ctx.drawImage(
                    this.image,
                    el.x, el.y,
                    el.width, el.height,
                    (this.offsetX + x) >> 0, (this.offsetY + y) >> 0,
                    this.ownerActor.width, el.height);

                return this;
            },
            paintChunk:function (ctx, dx, dy, x, y, w, h) {
                ctx.drawImage(this.image, x, y, w, h, dx, dy, w, h);
            },
            paintTile:function (ctx, index, x, y) {
                var el = this.mapInfo[index];
                ctx.drawImage(
                    this.image,
                    el.x, el.y,
                    el.width, el.height,
                    (this.offsetX + x) >> 0, (this.offsetY + y) >> 0,
                    el.width, el.height);

                return this;
            },
            /**
             * Draws the subimage pointed by imageIndex scaled to the size of w and h.
             * @param director {CAAT.Foundation.Director}
             * @param time {number} scene time.
             * @param x {number} x position in canvas to draw the image.
             * @param y {number} y position in canvas to draw the image.
             *
             * @return this
             */
            paintScaled:function (director, time, x, y) {

                var el = this.mapInfo[this.spriteIndex];

                director.ctx.drawImage(
                    this.image,
                    el.x, el.y,
                    el.width, el.height,
                    (this.offsetX + x) >> 0, (this.offsetY + y) >> 0,
                    this.ownerActor.width, this.ownerActor.height);

                return this;
            },
            getCurrentSpriteImageCSSPosition:function () {
                var el = this.mapInfo[this.spriteIndex];

                var x = -(el.x + this.parentOffsetX - this.offsetX);
                var y = -(el.y + this.parentOffsetY - this.offsetY);

                return '' + x + 'px ' +
                    y + 'px ' +
                    (this.ownerActor.transformation === CAAT.Foundation.SpriteImage.TR_TILE ? 'repeat' : 'no-repeat');
            },
            /**
             * Get the number of subimages in this compoundImage
             * @return {number}
             */
            getNumImages:function () {
                return this.rows * this.columns;
            },

            setUV:function (uvBuffer, uvIndex) {
                var im = this.image;

                if (!im.__texturePage) {
                    return;
                }

                var index = uvIndex;
                var sIndex = this.spriteIndex;
                var el = this.mapInfo[this.spriteIndex];

                var u = el.u;
                var v = el.v;
                var u1 = el.u1;
                var v1 = el.v1;
                if (this.offsetX || this.offsetY) {
                    var w = this.ownerActor.width;
                    var h = this.ownerActor.height;

                    var tp = im.__texturePage;

                    var _u = -this.offsetX / tp.width;
                    var _v = -this.offsetY / tp.height;
                    var _u1 = (w - this.offsetX) / tp.width;
                    var _v1 = (h - this.offsetY) / tp.height;

                    u = _u + im.__u;
                    v = _v + im.__v;
                    u1 = _u1 + im.__u;
                    v1 = _v1 + im.__v;
                }

                if (im.inverted) {
                    uvBuffer[index++] = u1;
                    uvBuffer[index++] = v;

                    uvBuffer[index++] = u1;
                    uvBuffer[index++] = v1;

                    uvBuffer[index++] = u;
                    uvBuffer[index++] = v1;

                    uvBuffer[index++] = u;
                    uvBuffer[index++] = v;
                } else {
                    uvBuffer[index++] = u;
                    uvBuffer[index++] = v;

                    uvBuffer[index++] = u1;
                    uvBuffer[index++] = v;

                    uvBuffer[index++] = u1;
                    uvBuffer[index++] = v1;

                    uvBuffer[index++] = u;
                    uvBuffer[index++] = v1;
                }
            },
            /**
             * Set the elapsed time needed to change the image index.
             * @param fps an integer indicating the time in milliseconds to change.
             * @return this
             */
            setChangeFPS:function (fps) {
                this.changeFPS = fps;
                return this;
            },
            /**
             * Set the transformation to apply to the Sprite image.
             * Any value of
             *  <li>TR_NONE
             *  <li>TR_FLIP_HORIZONTAL
             *  <li>TR_FLIP_VERTICAL
             *  <li>TR_FLIP_ALL
             *
             * @param transformation an integer indicating one of the previous values.
             * @return this
             */
            setSpriteTransformation:function (transformation) {
                this.transformation = transformation;
                var v = CAAT.Foundation.SpriteImage;
                switch (transformation) {
                    case v.TR_FLIP_HORIZONTAL:
                        this.paint = this.paintInvertedH;
                        break;
                    case v.TR_FLIP_VERTICAL:
                        this.paint = this.paintInvertedV;
                        break;
                    case v.TR_FLIP_ALL:
                        this.paint = this.paintInvertedHV;
                        break;
                    case v.TR_FIXED_TO_SIZE:
                        this.paint = this.paintScaled;
                        break;
                    case v.TR_FIXED_WIDTH_TO_SIZE:
                        this.paint = this.paintScaledWidth;
                        break;
                    case v.TR_TILE:
                        this.paint = this.paintTiled;
                        break;
                    default:
                        this.paint = this.paintN;
                }
                this.ownerActor.invalidate();
                return this;
            },

            resetAnimationTime:function () {
                this.prevAnimationTime = -1;
                return this;
            },

            /**
             * Set the sprite animation images index. This method accepts an array of objects which define indexes to
             * subimages inside this sprite image.
             * If the SpriteImage is instantiated by calling the method initialize( image, rows, cols ), the value of
             * aAnimationImageIndex should be an array of numbers, which define the indexes into an array of subimages
             * with size rows*columns.
             * If the method InitializeFromMap( image, map ) is called, the value for aAnimationImageIndex is expected
             * to be an array of strings which are the names of the subobjects contained in the map object.
             *
             * @param aAnimationImageIndex an array indicating the Sprite's frames.
             */
            setAnimationImageIndex:function (aAnimationImageIndex) {
                this.animationImageIndex = aAnimationImageIndex;
                this.spriteIndex = aAnimationImageIndex[0];
                this.prevAnimationTime = -1;

                return this;
            },
            setSpriteIndex:function (index) {
                this.spriteIndex = index;
                return this;
            },

            /**
             * Draws the sprite image calculated and stored in spriteIndex.
             *
             * @param time {number} Scene time when the bounding box is to be drawn.
             */
            setSpriteIndexAtTime:function (time) {

                if (this.animationImageIndex.length > 1) {
                    if (this.prevAnimationTime === -1) {
                        this.prevAnimationTime = time;

                        //thanks Phloog and ghthor, well spotted.
                        this.spriteIndex = this.animationImageIndex[0];
                        this.prevIndex= 0;
                        this.ownerActor.invalidate();
                    }
                    else {
                        var ttime = time;
                        ttime -= this.prevAnimationTime;
                        ttime /= this.changeFPS;
                        ttime %= this.animationImageIndex.length;
                        var idx = Math.floor(ttime);
//                    if ( this.spriteIndex!==idx ) {

                        if ( idx<this.prevIndex ) {   // we are getting back in time, or ended playing the animation
                            if ( this.callback ) {
                                this.callback( this, time );
                            }
                        }

                        this.prevIndex= idx;
                        this.spriteIndex = this.animationImageIndex[idx];
                        this.ownerActor.invalidate();
//                    }
                    }
                }
            },

            getMapInfo:function (index) {
                return this.mapInfo[ index ];
            },

            initializeFromGlyphDesigner : function( text ) {
                for (var i = 0; i < text.length; i++) {
                    if (0 === text[i].indexOf("char ")) {
                        var str = text[i].substring(5);
                        var pairs = str.split(' ');
                        var obj = {
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0,
                            xadvance: 0,
                            xoffset: 0,
                            yoffset: 0
                        };

                        for (var j = 0; j < pairs.length; j++) {
                            var pair = pairs[j];
                            var pairData = pair.split("=");
                            var key = pairData[0];
                            var value = pairData[1];
                            if (value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
                                value.substring(1, value.length - 1);
                            }
                            obj[ key ] = value;
                        }

                        this.addElement(String.fromCharCode(obj.id), obj);
                    }
                }

                return this;
            },

            /**
             * This method takes the output generated from the tool at http://labs.hyperandroid.com/static/texture/spriter.html
             * and creates a map into that image.
             * @param image {Image|HTMLImageElement|Canvas} an image
             * @param map {object} the map into the image to define subimages.
             */
            initializeFromMap:function (image, map) {
                this.initialize(image, 1, 1);

                var key;
                var helper;
                var count = 0;

                for (key in map) {
                    var value = map[key];

                    helper = new CAAT.Foundation.SpriteImageHelper(
                        parseFloat(value.x) + this.parentOffsetX,
                        parseFloat(value.y) + this.parentOffsetY,
                        parseFloat(value.width),
                        parseFloat(value.height),
                        image.width,
                        image.height
                    );

                    this.mapInfo[key] = helper;

                    // set a default spriteIndex
                    if (!count) {
                        this.setAnimationImageIndex([key]);
                    }

                    count++;
                }

                return this;
            },

            initializeFromTexturePackerJSON : function( image, obj ) {

                for( var img in obj.frames ) {
                    var imgData= obj.frames[img];

                    var si_obj= {
                        x: imgData.frame.x,
                        y: imgData.frame.y,
                        width: imgData.spriteSourceSize.w,
                        height: imgData.spriteSourceSize.h,
                        id: '0'
                    };

                    var si= new CAAT.Foundation.SpriteImage().initialize( image, 1, 1 );
                    si.addElement(0,si_obj);
                    CAAT.currentDirector.addImage( img.substring(0,img.indexOf('.')), si );
                }
            },

            /**
             * Add one element to the spriteImage.
             * @param key {string|number} index or sprite identifier.
             * @param value object{
             *      x: {number},
             *      y: {number},
             *      width: {number},
             *      height: {number},
             *      xoffset: {number=},
             *      yoffset: {number=},
             *      xadvance: {number=}
             *      }
             * @return {*}
             */
            addElement : function( key, value ) {
                var helper = new CAAT.Foundation.SpriteImageHelper(
                    parseFloat(value.x) + this.parentOffsetX,
                    parseFloat(value.y) + this.parentOffsetY,
                    parseFloat(value.width),
                    parseFloat(value.height),
                    this.image.width,
                    this.image.height );

                helper.xoffset = typeof value.xoffset === 'undefined' ? 0 : parseFloat(value.xoffset);
                helper.yoffset = typeof value.yoffset === 'undefined' ? 0 : parseFloat(value.yoffset);
                helper.xadvance = typeof value.xadvance === 'undefined' ? value.width : parseFloat(value.xadvance);

                this.mapInfo[key] = helper;

                return this;
            },

            /**
             *
             * @param image {Image|HTMLImageElement|Canvas}
             * @param map object with pairs "<a char>" : {
             *              id      : {number},
             *              height  : {number},
             *              xoffset : {number},
             *              letter  : {string},
             *              yoffset : {number},
             *              width   : {number},
             *              xadvance: {number},
             *              y       : {number},
             *              x       : {number}
             *          }
             */
            initializeAsGlyphDesigner:function (image, map) {
                this.initialize(image, 1, 1);

                var key;
                var helper;
                var count = 0;

                for (key in map) {
                    var value = map[key];

                    helper = new CAAT.Foundation.SpriteImageHelper(
                        parseFloat(value.x) + this.parentOffsetX,
                        parseFloat(value.y) + this.parentOffsetX,
                        parseFloat(value.width),
                        parseFloat(value.height),
                        image.width,
                        image.height
                    );

                    helper.xoffset = typeof value.xoffset === 'undefined' ? 0 : value.xoffset;
                    helper.yoffset = typeof value.yoffset === 'undefined' ? 0 : value.yoffset;
                    helper.xadvance = typeof value.xadvance === 'undefined' ? value.width : value.xadvance;

                    this.mapInfo[key] = helper;

                    // set a default spriteIndex
                    if (!count) {
                        this.setAnimationImageIndex([key]);
                    }

                    count++;
                }

                return this;

            },


            initializeAsFontMap:function (image, chars) {
                this.initialize(image, 1, 1);

                var helper;
                var x = 0;

                for (var i = 0; i < chars.length; i++) {
                    var value = chars[i];

                    helper = new CAAT.Foundation.SpriteImageHelper(
                        parseFloat(x) + this.parentOffsetX,
                        0 + this.parentOffsetY,
                        parseFloat(value.width),
                        image.height,
                        image.width,
                        image.height
                    );

                    helper.xoffset = 0;
                    helper.yoffset = 0;
                    helper.xadvance = value.width;


                    x += value.width;

                    this.mapInfo[chars[i].c] = helper;

                    // set a default spriteIndex
                    if (!i) {
                        this.setAnimationImageIndex([chars[i].c]);
                    }
                }

                return this;
            },

            /**
             * This method creates a font sprite image based on a proportional font
             * It assumes the font is evenly spaced in the image
             * Example:
             * var font =   new CAAT.SpriteImage().initializeAsMonoTypeFontMap(
             *  director.getImage('numbers'),
             *  "0123456789"
             * );
             */

            initializeAsMonoTypeFontMap:function (image, chars) {
                var map = [];
                var charArr = chars.split("");

                var w = image.width / charArr.length >> 0;

                for (var i = 0; i < charArr.length; i++) {
                    map.push({c:charArr[i], width:w });
                }

                return this.initializeAsFontMap(image, map);
            },

            stringWidth:function (str) {
                var i, l, w = 0, charInfo;

                for (i = 0, l = str.length; i < l; i++) {
                    charInfo = this.mapInfo[ str.charAt(i) ];
                    if (charInfo) {
                        w += charInfo.xadvance * this.fontScale;
                    }
                }

                return w;
            },

            stringHeight:function () {
                if (this.fontHeight) {
                    return this.fontHeight * this.fontScale;
                }

                var y = 0;
                for (var i in this.mapInfo) {
                    var mi = this.mapInfo[i];

                    var h = mi.height + mi.yoffset;
                    if (h > y) {
                        y = h;
                    }
                }

                this.fontHeight = y;
                return this.fontHeight * this.fontScale;
            },

            drawText:function (str, ctx, x, y) {
                var i, l, charInfo, w;

                for (i = 0; i < str.length; i++) {
                    charInfo = this.mapInfo[ str.charAt(i) ];
                    if (charInfo) {
                        w = charInfo.width;
                        if ( w>0 && charInfo.height>0 ) {
                            ctx.drawImage(
                                this.image,
                                charInfo.x, charInfo.y,
                                w, charInfo.height,

                                x + charInfo.xoffset* this.fontScale, y + charInfo.yoffset* this.fontScale,
                                w* this.fontScale, charInfo.height* this.fontScale);
                        }
                        x += charInfo.xadvance* this.fontScale;
                    }
                }
            },

            getFontData : function() {
                var as= (this.stringHeight() *.8)>>0;
                return {
                    height : this.stringHeight(),
                    ascent : as,
                    descent: this.stringHeight() - as
                };

            }

        }
    }
});
/**
 * See LICENSE file.
 *
 **/

CAAT.Module({




    /**
     *
     * CAAT.Foundation is the base namespace for all the core animation elements.
     *
     * @name Foundation
     * @namespace
     * @memberOf CAAT
     *
     */

    /**
     *
     * CAAT.Foundation.Actor is the base animable element. It is the base object for Director, Scene and
     * Container.
     *    <p>CAAT.Actor is the simplest object instance CAAT manages. Every on-screen element is an Actor instance.
     *        An Actor has entity, it has a size, position and can have input sent to it. Everything that has a
     *        visual representation is an Actor, including Director and Scene objects.</p>
     *    <p>This object has functionality for:</p>
     *    <ol>
     *        <li>Set location and size on screen. Actors are always rectangular shapes, but not needed to be AABB.</li>
     *        <li>Set affine transforms (rotation, scale and translation).</li>
     *        <li>Define life cycle.</li>
     *        <li>Manage alpha transparency.</li>
     *        <li>Manage and keep track of applied Behaviors. Behaviors apply transformations via key-framing.</li>
     *        <li>Compose transformations. A container Actor will transform its children before they apply their own transformation.</li>
     *        <li>Clipping capabilities. Either rectangular or arbitrary shapes.</li>
     *        <li>The API is developed to allow method chaining when possible.</li>
     *        <li>Handle input (either mouse events, touch, multitouch, keys and accelerometer).</li>
     *        <li>Show an image.</li>
     *        <li>Show some image animations.</li>
     *        <li>etc.</li>
     *    </ol>
     *
     * @name Actor
     * @memberOf CAAT.Foundation
     * @constructor
     *
     */

    defines:"CAAT.Foundation.Actor",
    aliases: [ "CAAT.Actor" ],
    depends: [
        "CAAT.Math.Dimension",
        "CAAT.Event.AnimationLoop",
        "CAAT.Foundation.SpriteImage",
        "CAAT.Core.Constants",
        "CAAT.Behavior.PathBehavior",
        "CAAT.Behavior.RotateBehavior",
        "CAAT.Behavior.ScaleBehavior",
        "CAAT.Behavior.Scale1Behavior",
        "CAAT.PathUtil.LinearPath",
        "CAAT.Event.AnimationLoop"
    ],
    constants :  {
        /**
         * @lends  CAAT.Foundation.Actor
         */

        /** @const @type {number} */ ANCHOR_CENTER:0, // constant values to determine different affine transform
        /** @const @type {number} */ ANCHOR_TOP:1, // anchors.
        /** @const @type {number} */ ANCHOR_BOTTOM:2,
        /** @const @type {number} */ ANCHOR_LEFT:3,
        /** @const @type {number} */ ANCHOR_RIGHT:4,
        /** @const @type {number} */ ANCHOR_TOP_LEFT:5,
        /** @const @type {number} */ ANCHOR_TOP_RIGHT:6,
        /** @const @type {number} */ ANCHOR_BOTTOM_LEFT:7,
        /** @const @type {number} */ ANCHOR_BOTTOM_RIGHT:8,
        /** @const @type {number} */ ANCHOR_CUSTOM:9,

        /** @const @type {number} */ CACHE_NONE:0,
        /** @const @type {number} */ CACHE_SIMPLE:1,
        /** @const @type {number} */ CACHE_DEEP:2
    },

    extendsWith : function () {

        var __index = 0;

        return  {

            /**
             * @lends CAAT.Foundation.Actor.prototype
             */

            __init:function () {
                this.behaviorList = [];
                this.lifecycleListenerList = [];
                this.AABB = new CAAT.Math.Rectangle();
                this.viewVertices = [
                    new CAAT.Math.Point(0, 0, 0),
                    new CAAT.Math.Point(0, 0, 0),
                    new CAAT.Math.Point(0, 0, 0),
                    new CAAT.Math.Point(0, 0, 0)
                ];

                this.scaleAnchor = CAAT.Foundation.Actor.ANCHOR_CENTER;

                this.modelViewMatrix = new CAAT.Math.Matrix();
                this.worldModelViewMatrix = new CAAT.Math.Matrix();

                this.resetTransform();
                this.setScale(1, 1);
                this.setRotation(0);

                this.id = __index++;

                return this;
            },

            /**
             * @type {object}
             */
            __super : null,

            /**
             * A collection of this Actors lifecycle observers.
             * @type { Array.<{actorLifeCycleEvent : function( CAAT.Foundation.Actor, string, number ) }> }
             */
            lifecycleListenerList:null,

            /**
             * A collection of behaviors to modify this actor´s properties.
             * @type { Array.<CAAT.Behavior.Behavior> }
             */
            behaviorList:null,

            /**
             * This actor's parent container.
             * @type { CAAT.Foundation.ActorContainer }
             */
            parent:null, // Parent of this Actor. May be Scene.

            /**
             * x position on parent. In parent's local coord. system.
             * @type {number}
             */
            x:0,
            /**
             * y position on parent. In parent's local coord. system.
             * @type {number}
             */
            y:0,

            /**
             * Actor's width. In parent's local coord. system.
             * @type {number}
             */
            width:0,

            /**
             * Actor's height. In parent's local coord. system.
             * @type {number}
             */
            height:0,

            /**
             * actor´s layout preferred size.
             * @type {CAAT.Math.Dimension}
             */
            preferredSize:null,

            /**
             * actor's layout minimum size.
             * @type {CAAT.Math.Dimension}
             */
            minimumSize:null,

            /**
             * Marks since when this actor, relative to scene time, is going to be animated/drawn.
             * @type {number}
             */
            start_time:0,

            /**
             * Marks from the time this actor is going to be animated, during how much time.
             * Forever by default.
             * @type {number}
             */
            duration:Number.MAX_VALUE,

            /**
             * Will this actor be clipped before being drawn on screen ?
             * @type {boolean}
             */
            clip:false,

            /**
             * If this.clip and this.clipPath===null, a rectangle will be used as clip area. Otherwise,
             * clipPath contains a reference to a CAAT.PathUtil.Path object.
             * @type {CAAT.PathUtil.Path}
             */
            clipPath:null,

            /**
             * Translation x anchor. 0..1
             * @type {number}
             */
            tAnchorX:0,

            /**
             * Translation y anchor. 0..1
             * @type {number}
             */
            tAnchorY:0,

            /**
             * ScaleX value.
             * @type {number}
             */
            scaleX:1, // transformation. width scale parameter

            /**
             * ScaleY value.
             * @type {number}
             */
            scaleY:1, // transformation. height scale parameter

            /**
             * Scale Anchor X. Value 0-1
             * @type {number}
             */
            scaleTX:.50, // transformation. scale anchor x position

            /**
             * Scale Anchor Y. Value 0-1
             * @type {number}
             */
            scaleTY:.50, // transformation. scale anchor y position

            /**
             * A value that corresponds to any CAAT.Foundation.Actor.ANCHOR_* value.
             * @type {CAAT.Foundation.Actor.ANCHOR_*}
             */
            scaleAnchor:0, // transformation. scale anchor

            /**
             * This actor´s rotation angle in radians.
             * @type {number}
             */
            rotationAngle:0, // transformation. rotation angle in radians

            /**
             * Rotation Anchor X. CAAT uses different Anchors for position, rotation and scale. Value 0-1.
             * @type {number}
             */
            rotationY:.50, // transformation. rotation center y

            /**
             * Rotation Anchor Y. CAAT uses different Anchors for position, rotation and scale. Value 0-1.
             * @type {number}
             */
            rotationX:.50, // transformation. rotation center x

            /**
             * Transparency value. 0 is totally transparent, 1 is totally opaque.
             * @type {number}
             */
            alpha:1, // alpha transparency value

            /**
             * true to make all children transparent, false, only this actor/container will be transparent.
             * @type {boolean}
             */
            isGlobalAlpha:false, // is this a global alpha

            /**
             * @type {number}
             * @private
             */
            frameAlpha:1, // hierarchically calculated alpha for this Actor.

            /**
             * Mark this actor as expired, or out of the scene time.
             * @type {boolean}
             */
            expired:false,

            /**
             * Mark this actor as discardable. If an actor is expired and mark as discardable, if will be
             * removed from its parent.
             * @type {boolean}
             */
            discardable:false, // set when you want this actor to be removed if expired

            /**
             * @type {boolean}
             */
            pointed:false, // is the mouse pointer inside this actor

            /**
             * Enable or disable input on this actor. By default, all actors receive input.
             * See also priority lists.
             * see demo4 for an example of input and priority lists.
             * @type {boolean}
             */
            mouseEnabled:true, // events enabled ?

            /**
             * Make this actor visible or not.
             * An invisible actor avoids making any calculation, applying any behavior on it.
             * @type {boolean}
             */
            visible:true,

            /**
             * any canvas rendering valid fill style.
             * @type {string}
             */
            fillStyle:null,

            /**
             * any canvas rendering valid stroke style.
             * @type {string}
             */
            strokeStyle:null,

            /**
             * This actor´s scene time.
             * @type {number}
             */
            time:0, // Cache Scene time.

            /**
             * This rectangle keeps the axis aligned bounding box in screen coords of this actor.
             * In can be used, among other uses, to realize whether two given actors collide regardless
             * the affine transformation is being applied on them.
             * @type {CAAT.Math.Rectangle}
             */
            AABB:null,

            /**
             * These 4 CAAT.Math.Point objects are the vertices of this actor´s non axis aligned bounding
             * box. If the actor is not rotated, viewVertices and AABB define the same bounding box.
             * @type {Array.<CAAT.Math.Point>}
             */
            viewVertices:null, // model to view transformed vertices.

            /**
             * Is this actor processed in the last frame ?
             * @type {boolean}
             */
            inFrame:false, // boolean indicating whether this Actor was present on last frame.

            /**
             * Local matrix dirtyness flag.
             * @type {boolean}
             * @private
             */
            dirty:true, // model view is dirty ?

            /**
             * Global matrix dirtyness flag.
             * @type {boolean}
             * @private
             */
            wdirty:true, // world model view is dirty ?

            /**
             * @type {number}
             * @private
             */
            oldX:-1,

            /**
             * @type {number}
             * @private
             */
            oldY:-1,

            /**
             * This actor´s affine transformation matrix.
             * @type {CAAT.Math.Matrix}
             */
            modelViewMatrix:null, // model view matrix.

            /**
             * This actor´s world affine transformation matrix.
             * @type {CAAT.Math.Matrix}
             */
            worldModelViewMatrix:null, // world model view matrix.

            /**
             * @type {CAAT.Math.Matrix}
             */
            modelViewMatrixI:null, // model view matrix.

            /**
             * @type {CAAT.Math.Matrix}
             */
            worldModelViewMatrixI:null, // world model view matrix.

            /**
             * Is this actor enabled on WebGL ?
             * @type {boolean}
             */
            glEnabled:false,

            /**
             * Define this actor´s background image.
             * See SpriteImage object.
             * @type {CAAT.Foundation.SpriteImage}
             */
            backgroundImage:null,

            /**
             * Set this actor´ id so that it can be later identified easily.
             * @type {object}
             */
            id:null,

            /**
             * debug info.
             * @type {number}
             */
            size_active:1, // number of animated children

            /**
             * debug info.
             * @type {number}
             */
            size_total:1,

            __d_ax:-1, // for drag-enabled actors.
            __d_ay:-1,

            /**
             * Is gesture recognition enabled on this actor ??
             * @type {boolean}
             */
            gestureEnabled:false,

            /**
             * If dirty rects are enabled, this flag indicates the rendering engine to invalidate this
             * actor´s screen area.
             * @type {boolean}
             */
            invalid:true,

            /**
             * Caching as bitmap strategy. Suitable to cache very complex actors.
             *
             * 0 : no cache.
             * CACHE_SIMPLE : if a container, only cache the container.
             * CACHE_DEEP : if a container, cache the container and recursively all of its children.
             *
             * @type {number}
             */
            cached:0, // 0 no, CACHE_SIMPLE | CACHE_DEEP

            /**
             * Exclude this actor from automatic layout on its parent.
             * @type {boolean}
             */
            preventLayout : false,

            /**
             * is this actor/container Axis aligned ? if so, much faster inverse matrices can be calculated.
             * @type {boolean}
             * @private
             */
            isAA:true,

            /**
             * if this actor is cached, when destroy is called, it does not call 'clean' method, which clears some
             * internal properties.
             */
            isCachedActor : false,

            setCachedActor : function(cached) {
                this.isCachedActor= cached;
                return this;
            },

            /**
             * Make this actor not be laid out.
             */
            setPreventLayout : function(b) {
                this.preventLayout= b;
                return this;
            },

            invalidateLayout:function () {
                if (this.parent && !this.parent.layoutInvalidated) {
                    this.parent.invalidateLayout();
                }

                return this;
            },

            __validateLayout:function () {

            },

            /**
             * Set this actors preferred layout size.
             *
             * @param pw {number}
             * @param ph {number}
             * @return {*}
             */
            setPreferredSize:function (pw, ph) {
                if (!this.preferredSize) {
                    this.preferredSize = new CAAT.Math.Dimension();
                }
                this.preferredSize.width = pw;
                this.preferredSize.height = ph;
                return this;
            },

            getPreferredSize:function () {
                return this.preferredSize ? this.preferredSize :
                    this.getMinimumSize();
            },

            /**
             * Set this actors minimum layout size.
             *
             * @param pw {number}
             * @param ph {number}
             * @return {*}
             */
            setMinimumSize:function (pw, ph) {
                if (!this.minimumSize) {
                    this.minimumSize = new CAAT.Math.Dimension();
                }

                this.minimumSize.width = pw;
                this.minimumSize.height = ph;
                return this;
            },

            getMinimumSize:function () {
                return this.minimumSize ? this.minimumSize :
                    new CAAT.Math.Dimension(this.width, this.height);
            },

            /**
             * @deprecated
             * @return {*}
             */
            create:function () {
                return this;
            },
            /**
             * Move this actor to a position.
             * It creates and adds a new PathBehavior.
             * @param x {number} new x position
             * @param y {number} new y position
             * @param duration {number} time to take to get to new position
             * @param delay {=number} time to wait before start moving
             * @param interpolator {=CAAT.Behavior.Interpolator} a CAAT.Behavior.Interpolator instance
             */
            moveTo:function (x, y, duration, delay, interpolator, callback) {

                if (x === this.x && y === this.y) {
                    return;
                }

                var id = '__moveTo';
                var b = this.getBehavior(id);
                if (!b) {
                    b = new CAAT.Behavior.PathBehavior().
                        setId(id).
                        setValues(new CAAT.PathUtil.LinearPath());
                    this.addBehavior(b);
                }

                b.path.setInitialPosition(this.x, this.y).setFinalPosition(x, y);
                b.setDelayTime(delay ? delay : 0, duration);
                if (interpolator) {
                    b.setInterpolator(interpolator);
                }

                if (callback) {
                    b.lifecycleListenerList = [];
                    b.addListener({
                        behaviorExpired:function (behavior, time, actor) {
                            callback(behavior, time, actor);
                        }
                    });
                }

                return this;
            },

            /**
             *
             * @param angle {number} new rotation angle
             * @param duration {number} time to rotate
             * @param delay {number=} millis to start rotation
             * @param anchorX {number=} rotation anchor x
             * @param anchorY {number=} rotation anchor y
             * @param interpolator {CAAT.Behavior.Interpolator=}
             * @return {*}
             */
            rotateTo:function (angle, duration, delay, anchorX, anchorY, interpolator) {

                if (angle === this.rotationAngle) {
                    return;
                }

                var id = '__rotateTo';
                var b = this.getBehavior(id);
                if (!b) {
                    b = new CAAT.Behavior.RotateBehavior().
                        setId(id).
                        setValues(0, 0, .5, .5);
                    this.addBehavior(b);
                }

                b.setValues(this.rotationAngle, angle, anchorX, anchorY).
                    setDelayTime(delay ? delay : 0, duration);

                if (interpolator) {
                    b.setInterpolator(interpolator);
                }

                return this;
            },

            /**
             *
             * @param scaleX {number} new X scale
             * @param scaleY {number} new Y scale
             * @param duration {number} time to rotate
             * @param delay {=number} millis to start rotation
             * @param anchorX {=number} rotation anchor x
             * @param anchorY {=number} rotation anchor y
             * @param interpolator {=CAAT.Behavior.Interpolator}
             * @return {*}
             */
            scaleTo:function (scaleX, scaleY, duration, delay, anchorX, anchorY, interpolator) {

                if (this.scaleX === scaleX && this.scaleY === scaleY) {
                    return;
                }

                var id = '__scaleTo';
                var b = this.getBehavior(id);
                if (!b) {
                    b = new CAAT.Behavior.ScaleBehavior().
                        setId(id).
                        setValues(1, 1, 1, 1, .5, .5);
                    this.addBehavior(b);
                }

                b.setValues(this.scaleX, scaleX, this.scaleY, scaleY, anchorX, anchorY).
                    setDelayTime(delay ? delay : 0, duration);

                if (interpolator) {
                    b.setInterpolator(interpolator);
                }

                return this;
            },

            /**
             *
             * @param scaleX {number} new X scale
             * @param duration {number} time to rotate
             * @param delay {=number} millis to start rotation
             * @param anchorX {=number} rotation anchor x
             * @param anchorY {=number} rotation anchor y
             * @param interpolator {=CAAT.Behavior.Interpolator}
             * @return {*}
             */
            scaleXTo:function (scaleX, duration, delay, anchorX, anchorY, interpolator) {
                return this.__scale1To(
                    CAAT.Behavior.Scale1Behavior.AXIS_X,
                    scaleX,
                    duration,
                    delay,
                    anchorX,
                    anchorY,
                    interpolator
                );
            },

            /**
             *
             * @param scaleY {number} new Y scale
             * @param duration {number} time to rotate
             * @param delay {=number} millis to start rotation
             * @param anchorX {=number} rotation anchor x
             * @param anchorY {=number} rotation anchor y
             * @param interpolator {=CAAT.Behavior.Interpolator}
             * @return {*}
             */
            scaleYTo:function (scaleY, duration, delay, anchorX, anchorY, interpolator) {
                return this.__scale1To(
                    CAAT.Behavior.Scale1Behavior.AXIS_Y,
                    scaleY,
                    duration,
                    delay,
                    anchorX,
                    anchorY,
                    interpolator
                );
            },

            /**
             * @param axis {CAAT.Scale1Behavior.AXIS_X|CAAT.Scale1Behavior.AXIS_Y} scale application axis
             * @param scale {number} new Y scale
             * @param duration {number} time to rotate
             * @param delay {=number} millis to start rotation
             * @param anchorX {=number} rotation anchor x
             * @param anchorY {=number} rotation anchor y
             * @param interpolator {=CAAT.Bahavior.Interpolator}
             * @return {*}
             */
            __scale1To:function (axis, scale, duration, delay, anchorX, anchorY, interpolator) {

                if (( axis === CAAT.Behavior.Scale1Behavior.AXIS_X && scale === this.scaleX) ||
                    ( axis === CAAT.Behavior.Scale1Behavior.AXIS_Y && scale === this.scaleY)) {

                    return;
                }

                var id = '__scaleXTo';
                var b = this.getBehavior(id);
                if (!b) {
                    b = new CAAT.Behavior.Scale1Behavior().
                        setId(id).
                        setValues(1, 1, axis === CAAT.Behavior.Scale1Behavior.AXIS_X, .5, .5);
                    this.addBehavior(b);
                }

                b.setValues(
                    axis ? this.scaleX : this.scaleY,
                    scale,
                    anchorX,
                    anchorY).
                    setDelayTime(delay ? delay : 0, duration);

                if (interpolator) {
                    b.setInterpolator(interpolator);
                }

                return this;
            },

            /**
             * Touch Start only received when CAAT.TOUCH_BEHAVIOR= CAAT.TOUCH_AS_MULTITOUCH
             * @param e <CAAT.TouchEvent>
             */
            touchStart:function (e) {
            },
            touchMove:function (e) {
            },
            touchEnd:function (e) {
            },
            gestureStart:function (rotation, scaleX, scaleY) {
            },
            gestureChange:function (rotation, scaleX, scaleY) {
                if (this.gestureEnabled) {
                    this.setRotation(rotation);
                    this.setScale(scaleX, scaleY);
                }
                return this;
            },
            gestureEnd:function (rotation, scaleX, scaleY) {
            },

            isVisible:function () {
                return this.visible;
            },

            invalidate:function () {
                this.invalid = true;
                return this;
            },
            setGestureEnabled:function (enable) {
                this.gestureEnabled = !!enable;
                return this;
            },
            isGestureEnabled:function () {
                return this.gestureEnabled;
            },
            getId:function () {
                return this.id;
            },
            setId:function (id) {
                this.id = id;
                return this;
            },
            /**
             * Set this actor's parent.
             * @param parent {CAAT.Foundation.ActorContainer}
             * @return this
             */
            setParent:function (parent) {
                this.parent = parent;
                return this;
            },
            /**
             * Set this actor's background image.
             * The need of a background image is to kept compatibility with the new CSSDirector class.
             * The image parameter can be either an Image/Canvas or a CAAT.Foundation.SpriteImage instance. If an image
             * is supplied, it will be wrapped into a CAAT.Foundation.SriteImage instance of 1 row by 1 column.
             * If the actor has set an image in the background, the paint method will draw the image, otherwise
             * and if set, will fill its background with a solid color.
             * If adjust_size_to_image is true, the host actor will be redimensioned to the size of one
             * single image from the SpriteImage (either supplied or generated because of passing an Image or
             * Canvas to the function). That means the size will be set to [width:SpriteImage.singleWidth,
             * height:singleHeight].
             *
             * WARN: if using a CSS renderer, the image supplied MUST be a HTMLImageElement instance.
             *
             * @see CAAT.Foundation.SpriteImage
             *
             * @param image {Image|HTMLCanvasElement|CAAT.Foundation.SpriteImage}
             * @param adjust_size_to_image {boolean} whether to set this actor's size based on image parameter.
             *
             * @return this
             */
            setBackgroundImage:function (image, adjust_size_to_image) {
                if (image) {
                    if (!(image instanceof CAAT.Foundation.SpriteImage)) {
                        if ( isString(image) ) {
                            image = new CAAT.Foundation.SpriteImage().initialize(CAAT.currentDirector.getImage(image), 1, 1);
                        } else {
                            image = new CAAT.Foundation.SpriteImage().initialize(image, 1, 1);
                        }
                    } else {
                        image= image.getRef();
                    }

                    image.setOwner(this);
                    this.backgroundImage = image;
                    if (typeof adjust_size_to_image === 'undefined' || adjust_size_to_image) {
                        this.width = image.getWidth();
                        this.height = image.getHeight();
                    }

                    this.glEnabled = true;

                    this.invalidate();

                } else {
                    this.backgroundImage = null;
                }

                return this;
            },
            /**
             * Set the actor's SpriteImage index from animation sheet.
             * @see CAAT.Foundation.SpriteImage
             * @param index {number}
             *
             * @return this
             */
            setSpriteIndex:function (index) {
                if (this.backgroundImage) {
                    this.backgroundImage.setSpriteIndex(index);
                    this.invalidate();
                }

                return this;

            },
            /**
             * Set this actor's background SpriteImage offset displacement.
             * The values can be either positive or negative meaning the texture space of this background
             * image does not start at (0,0) but at the desired position.
             * @see CAAT.Foundation.SpriteImage
             * @param ox {number} horizontal offset
             * @param oy {number} vertical offset
             *
             * @return this
             */
            setBackgroundImageOffset:function (ox, oy) {
                if (this.backgroundImage) {
                    this.backgroundImage.setOffset(ox, oy);
                }

                return this;
            },
            /**
             * Set this actor's background SpriteImage its animation sequence.
             * In its simplet's form a SpriteImage treats a given image as an array of rows by columns
             * subimages. If you define d Sprite Image of 2x2, you'll be able to draw any of the 4 subimages.
             * This method defines the animation sequence so that it could be set [0,2,1,3,2,1] as the
             * animation sequence
             * @param ii {Array<number>} an array of integers.
             */
            setAnimationImageIndex:function (ii) {
                if (this.backgroundImage) {
                    this.backgroundImage.resetAnimationTime();
                    this.backgroundImage.setAnimationImageIndex(ii);
                    this.invalidate();
                }
                return this;
            },

            addAnimation : function( name, array, time, callback ) {
                if (this.backgroundImage) {
                    this.backgroundImage.addAnimation(name, array, time, callback);
                }
                return this;
            },

            playAnimation : function(name) {
                if (this.backgroundImage) {
                    this.backgroundImage.playAnimation(name);
                }
                return this;
            },

            setAnimationEndCallback : function(f) {
                if (this.backgroundImage) {
                    this.backgroundImage.setAnimationEndCallback(f);
                }
                return this;
            },

            resetAnimationTime:function () {
                if (this.backgroundImage) {
                    this.backgroundImage.resetAnimationTime();
                    this.invalidate();
                }
                return this;
            },

            setChangeFPS:function (time) {
                if (this.backgroundImage) {
                    this.backgroundImage.setChangeFPS(time);
                }
                return this;

            },
            /**
             * Set this background image transformation.
             * If GL is enabled, this parameter has no effect.
             * @param it any value from CAAT.Foundation.SpriteImage.TR_*
             * @return this
             */
            setImageTransformation:function (it) {
                if (this.backgroundImage) {
                    this.backgroundImage.setSpriteTransformation(it);
                }
                return this;
            },
            /**
             * Center this actor at position (x,y).
             * @param x {number} x position
             * @param y {number} y position
             *
             * @return this
             * @deprecated
             */
            centerOn:function (x, y) {
                this.setPosition(x - this.width / 2, y - this.height / 2);
                return this;
            },
            /**
             * Center this actor at position (x,y).
             * @param x {number} x position
             * @param y {number} y position
             *
             * @return this
             */
            centerAt:function (x, y) {
                this.setPosition(
                    x - this.width * (.5 - this.tAnchorX ),
                    y - this.height * (.5 - this.tAnchorY ) );
                return this;
            },
            /**
             * If GL is enables, get this background image's texture page, otherwise it will fail.
             * @return {CAAT.GLTexturePage}
             */
            getTextureGLPage:function () {
                return this.backgroundImage.image.__texturePage;
            },
            /**
             * Set this actor invisible.
             * The actor is animated but not visible.
             * A container won't show any of its children if set visible to false.
             *
             * @param visible {boolean} set this actor visible or not.
             * @return this
             */
            setVisible:function (visible) {
                this.invalidate();
                // si estoy visible y quiero hacerme no visible
                if (CAAT.currentDirector && CAAT.currentDirector.dirtyRectsEnabled && !visible && this.visible) {
                    // if dirty rects, add this actor
                    CAAT.currentDirector.scheduleDirtyRect(this.AABB);
                }

                if ( visible && !this.visible) {
                    this.dirty= true;
                }

                this.visible = visible;
                return this;
            },
            /**
             * Puts an Actor out of time line, that is, won't be transformed nor rendered.
             * @return this
             */
            setOutOfFrameTime:function () {
                this.setFrameTime(-1, 0);
                return this;
            },
            /**
             * Adds an Actor's life cycle listener.
             * The developer must ensure the actorListener is not already a listener, otherwise
             * it will notified more than once.
             * @param actorListener {object} an object with at least a method of the form:
             * <code>actorLyfeCycleEvent( actor, string_event_type, long_time )</code>
             */
            addListener:function (actorListener) {
                this.lifecycleListenerList.push(actorListener);
                return this;
            },
            /**
             * Removes an Actor's life cycle listener.
             * It will only remove the first occurrence of the given actorListener.
             * @param actorListener {object} an Actor's life cycle listener.
             */
            removeListener:function (actorListener) {
                var n = this.lifecycleListenerList.length;
                while (n--) {
                    if (this.lifecycleListenerList[n] === actorListener) {
                        // remove the nth element.
                        this.lifecycleListenerList.splice(n, 1);
                        return;
                    }
                }
            },
            /**
             * Set alpha composition scope. global will mean this alpha value will be its children maximum.
             * If set to false, only this actor will have this alpha value.
             * @param global {boolean} whether the alpha value should be propagated to children.
             */
            setGlobalAlpha:function (global) {
                this.isGlobalAlpha = global;
                return this;
            },
            /**
             * Notifies the registered Actor's life cycle listener about some event.
             * @param sEventType an string indicating the type of event being notified.
             * @param time an integer indicating the time related to Scene's timeline when the event
             * is being notified.
             */
            fireEvent:function (sEventType, time) {
                for (var i = 0; i < this.lifecycleListenerList.length; i++) {
                    this.lifecycleListenerList[i].actorLifeCycleEvent(this, sEventType, time);
                }
            },
            /**
             * Sets this Actor as Expired.
             * If this is a Container, all the contained Actors won't be nor drawn nor will receive
             * any event. That is, expiring an Actor means totally taking it out the Scene's timeline.
             * @param time {number} an integer indicating the time the Actor was expired at.
             * @return this.
             */
            setExpired:function (time) {
                this.expired = true;
                this.fireEvent('expired', time);
                return this;
            },
            /**
             * Enable or disable the event bubbling for this Actor.
             * @param enable {boolean} a boolean indicating whether the event bubbling is enabled.
             * @return this
             */
            enableEvents:function (enable) {
                this.mouseEnabled = enable;
                return this;
            },
            /**
             * Removes all behaviors from an Actor.
             * @return this
             */
            emptyBehaviorList:function () {
                this.behaviorList = [];
                return this;
            },
            /**
             * Caches a fillStyle in the Actor.
             * @param style a valid Canvas rendering context fillStyle.
             * @return this
             */
            setFillStyle:function (style) {
                this.fillStyle = style;
                this.invalidate();
                return this;
            },
            /**
             * Caches a stroke style in the Actor.
             * @param style a valid canvas rendering context stroke style.
             * @return this
             */
            setStrokeStyle:function (style) {
                this.strokeStyle = style;
                this.invalidate();
                return this;
            },
            /**
             * @deprecated
             * @param paint
             */
            setPaint:function (paint) {
                return this.setFillStyle(paint);
            },
            /**
             * Stablishes the Alpha transparency for the Actor.
             * If it globalAlpha enabled, this alpha will the maximum alpha for every contained actors.
             * The alpha must be between 0 and 1.
             * @param alpha a float indicating the alpha value.
             * @return this
             */
            setAlpha:function (alpha) {
                this.alpha = alpha;
                this.invalidate();
                return this;
            },
            /**
             * Remove all transformation values for the Actor.
             * @return this
             */
            resetTransform:function () {
                this.rotationAngle = 0;
                this.rotationX = .5;
                this.rotationY = .5;
                this.scaleX = 1;
                this.scaleY = 1;
                this.scaleTX = .5;
                this.scaleTY = .5;
                this.scaleAnchor = 0;
                this.oldX = -1;
                this.oldY = -1;
                this.dirty = true;

                return this;
            },
            /**
             * Sets the time life cycle for an Actor.
             * These values are related to Scene time.
             * @param startTime an integer indicating the time until which the Actor won't be visible on the Scene.
             * @param duration an integer indicating how much the Actor will last once visible.
             * @return this
             */
            setFrameTime:function (startTime, duration) {
                this.start_time = startTime;
                this.duration = duration;
                this.expired = false;
                this.dirty = true;

                return this;
            },
            /**
             * This method should me overriden by every custom Actor.
             * It will be the drawing routine called by the Director to show every Actor.
             * @param director {CAAT.Foundation.Director} instance that contains the Scene the Actor is in.
             * @param time {number} indicating the Scene time in which the drawing is performed.
             */
            paint:function (director, time) {
                if (this.backgroundImage) {
                    this.backgroundImage.paint(director, time, 0, 0);
                } else if (this.fillStyle) {
                    var ctx = director.ctx;
                    ctx.fillStyle = this.fillStyle;
                    ctx.fillRect(0, 0, this.width, this.height);
                }

            },
            /**
             * A helper method to setScaleAnchored with an anchor of ANCHOR_CENTER
             *
             * @see setScaleAnchored
             *
             * @param sx a float indicating a width size multiplier.
             * @param sy a float indicating a height size multiplier.
             * @return this
             */
            setScale:function (sx, sy) {
                this.scaleX = sx;
                this.scaleY = sy;
                this.dirty = true;
                return this;
            },
            getAnchorPercent:function (anchor) {

                var anchors = [
                    .50, .50, .50, 0, .50, 1.00,
                    0, .50, 1.00, .50, 0, 0,
                    1.00, 0, 0, 1.00, 1.00, 1.00
                ];

                return { x:anchors[anchor * 2], y:anchors[anchor * 2 + 1] };
            },
            /**
             * Private.
             * Gets a given anchor position referred to the Actor.
             * @param anchor
             * @return an object of the form { x: float, y: float }
             */
            getAnchor:function (anchor) {
                var tx = 0, ty = 0;

                var A= CAAT.Foundation.Actor;

                switch (anchor) {
                    case A.ANCHOR_CENTER:
                        tx = .5;
                        ty = .5;
                        break;
                    case A.ANCHOR_TOP:
                        tx = .5;
                        ty = 0;
                        break;
                    case A.ANCHOR_BOTTOM:
                        tx = .5;
                        ty = 1;
                        break;
                    case A.ANCHOR_LEFT:
                        tx = 0;
                        ty = .5;
                        break;
                    case A.ANCHOR_RIGHT:
                        tx = 1;
                        ty = .5;
                        break;
                    case A.ANCHOR_TOP_RIGHT:
                        tx = 1;
                        ty = 0;
                        break;
                    case A.ANCHOR_BOTTOM_LEFT:
                        tx = 0;
                        ty = 1;
                        break;
                    case A.ANCHOR_BOTTOM_RIGHT:
                        tx = 1;
                        ty = 1;
                        break;
                    case A.ANCHOR_TOP_LEFT:
                        tx = 0;
                        ty = 0;
                        break;
                }

                return {x:tx, y:ty};
            },

            setGlobalAnchor:function (ax, ay) {
                this.tAnchorX = ax;
                this.rotationX = ax;
                this.scaleTX = ax;

                this.tAnchorY = ay;
                this.rotationY = ay;
                this.scaleTY = ay;

                this.dirty = true;
                return this;
            },

            setScaleAnchor:function (sax, say) {
                this.scaleTX = sax;
                this.scaleTY = say;
                this.dirty = true;
                return this;
            },
            /**
             * Modify the dimensions on an Actor.
             * The dimension will not affect the local coordinates system in opposition
             * to setSize or setBounds.
             *
             * @param sx {number} width scale.
             * @param sy {number} height scale.
             * @param anchorx {number} x anchor to perform the Scale operation.
             * @param anchory {number} y anchor to perform the Scale operation.
             *
             * @return this;
             */
            setScaleAnchored:function (sx, sy, anchorx, anchory) {
                this.scaleTX = anchorx;
                this.scaleTY = anchory;

                this.scaleX = sx;
                this.scaleY = sy;

                this.dirty = true;

                return this;
            },

            setRotationAnchor:function (rax, ray) {
                this.rotationX = ray;
                this.rotationY = rax;
                this.dirty = true;
                return this;
            },
            /**
             * A helper method for setRotationAnchored. This methods stablishes the center
             * of rotation to be the center of the Actor.
             *
             * @param angle a float indicating the angle in radians to rotate the Actor.
             * @return this
             */
            setRotation:function (angle) {
                this.rotationAngle = angle;
                this.dirty = true;
                return this;
            },
            /**
             * This method sets Actor rotation around a given position.
             * @param angle {number} indicating the angle in radians to rotate the Actor.
             * @param rx {number} value in the range 0..1
             * @param ry {number} value in the range 0..1
             * @return this;
             */
            setRotationAnchored:function (angle, rx, ry) {
                this.rotationAngle = angle;
                this.rotationX = rx;
                this.rotationY = ry;
                this.dirty = true;
                return this;
            },
            /**
             * Sets an Actor's dimension
             * @param w a float indicating Actor's width.
             * @param h a float indicating Actor's height.
             * @return this
             */
            setSize:function (w, h) {

                this.width = w;
                this.height = h;

                this.dirty = true;

                return this;
            },
            /**
             * Set location and dimension of an Actor at once.
             *
             * @param x{number} a float indicating Actor's x position.
             * @param y{number} a float indicating Actor's y position
             * @param w{number} a float indicating Actor's width
             * @param h{number} a float indicating Actor's height
             * @return this
             */
            setBounds:function (x, y, w, h) {

                this.x = x;
                this.y = y;
                this.width = w;
                this.height = h;

                this.dirty = true;

                return this;
            },
            /**
             * This method sets the position of an Actor inside its parent.
             *
             * @param x{number} a float indicating Actor's x position
             * @param y{number} a float indicating Actor's y position
             * @return this
             *
             * @deprecated
             */
            setLocation:function (x, y) {
                this.x = x;
                this.y = y;
                this.oldX = x;
                this.oldY = y;

                this.dirty = true;

                return this;
            },

            setPosition:function (x, y) {
                return this.setLocation(x, y);
            },

            setPositionAnchor:function (pax, pay) {
                this.tAnchorX = pax;
                this.tAnchorY = pay;
                return this;
            },

            setPositionAnchored:function (x, y, pax, pay) {
                this.setLocation(x, y);
                this.tAnchorX = pax;
                this.tAnchorY = pay;
                return this;
            },


            /**
             * This method is called by the Director to know whether the actor is on Scene time.
             * In case it was necessary, this method will notify any life cycle behaviors about
             * an Actor expiration.
             * @param time {number} time indicating the Scene time.
             *
             * @private
             *
             */
            isInAnimationFrame:function (time) {
                if (this.expired) {
                    return false;
                }

                if (this.duration === Number.MAX_VALUE) {
                    return this.start_time <= time;
                }

                if (time >= this.start_time + this.duration) {
                    if (!this.expired) {
                        this.setExpired(time);
                    }

                    return false;
                }

                return this.start_time <= time && time < this.start_time + this.duration;
            },
            /**
             * Checks whether a coordinate is inside the Actor's bounding box.
             * @param x {number} a float
             * @param y {number} a float
             *
             * @return boolean indicating whether it is inside.
             */
            contains:function (x, y) {
                return x >= 0 && y >= 0 && x < this.width && y < this.height;
            },

            /**
             * Add a Behavior to the Actor.
             * An Actor accepts an undefined number of Behaviors.
             *
             * @param behavior {CAAT.Behavior.BaseBehavior}
             * @return this
             */
            addBehavior:function (behavior) {
                this.behaviorList.push(behavior);
                return this;
            },

            /**
             * Remove a Behavior from the Actor.
             * If the Behavior is not present at the actor behavior collection nothing happends.
             *
             * @param behavior {CAAT.Behavior.BaseBehavior}
             */
            removeBehaviour:function (behavior) {
                var c = this.behaviorList;
                var n = c.length - 1;
                while (n) {
                    if (c[n] === behavior) {
                        c.splice(n, 1);
                        return this;
                    }
                }
                return this;
            },
            /**
             * Remove a Behavior with id param as behavior identifier from this actor.
             * This function will remove ALL behavior instances with the given id.
             *
             * @param id {number} an integer.
             * return this;
             */
            removeBehaviorById:function (id) {
                var c = this.behaviorList;
                for (var n = 0; n < c.length; n++) {
                    if (c[n].id === id) {
                        c.splice(n, 1);
                    }
                }

                return this;

            },
            getBehavior:function (id) {
                var c = this.behaviorList;
                for (var n = 0; n < c.length; n++) {
                    var cc = c[n];
                    if (cc.id === id) {
                        return cc;
                    }
                }
                return null;
            },
            /**
             * Set discardable property. If an actor is discardable, upon expiration will be removed from
             * scene graph and hence deleted.
             * @param discardable {boolean} a boolean indicating whether the Actor is discardable.
             * @return this
             */
            setDiscardable:function (discardable) {
                this.discardable = discardable;
                return this;
            },
            /**
             * This method will be called internally by CAAT when an Actor is expired, and at the
             * same time, is flagged as discardable.
             * It notifies the Actor life cycle listeners about the destruction event.
             *
             * @param time an integer indicating the time at wich the Actor has been destroyed.
             *
             * @private
             *
             */
            destroy:function (time) {
                if (this.parent) {
                    this.parent.removeChild(this);
                }

                this.fireEvent('destroyed', time);
                if ( !this.isCachedActor ) {
                    this.clean();
                }

            },

            clean : function() {
                this.backgroundImage= null;
                this.emptyBehaviorList();
                this.lifecycleListenerList= [];
            },

            /**
             * Transform a point or array of points in model space to view space.
             *
             * @param point {CAAT.Math.Point|Array} an object of the form {x : float, y: float}
             *
             * @return the source transformed elements.
             *
             * @private
             *
             */
            modelToView:function (point) {
                var x, y, pt, tm;

                if (this.dirty) {
                    this.setModelViewMatrix();
                }

                tm = this.worldModelViewMatrix.matrix;

                if (point instanceof Array) {
                    for (var i = 0; i < point.length; i++) {
                        //this.worldModelViewMatrix.transformCoord(point[i]);
                        pt = point[i];
                        x = pt.x;
                        y = pt.y;
                        pt.x = x * tm[0] + y * tm[1] + tm[2];
                        pt.y = x * tm[3] + y * tm[4] + tm[5];
                    }
                }
                else {
//                this.worldModelViewMatrix.transformCoord(point);
                    x = point.x;
                    y = point.y;
                    point.x = x * tm[0] + y * tm[1] + tm[2];
                    point.y = x * tm[3] + y * tm[4] + tm[5];
                }

                return point;
            },
            /**
             * Transform a local coordinate point on this Actor's coordinate system into
             * another point in otherActor's coordinate system.
             * @param point {CAAT.Math.Point}
             * @param otherActor {CAAT.Math.Actor}
             */
            modelToModel:function (point, otherActor) {
                if (this.dirty) {
                    this.setModelViewMatrix();
                }

                return otherActor.viewToModel(this.modelToView(point));
            },
            /**
             * Transform a point from model to view space.
             * <p>
             * WARNING: every call to this method calculates
             * actor's world model view matrix.
             *
             * @param point {CAAT.Math.Point} a point in screen space to be transformed to model space.
             *
             * @return the source point object
             *
             *
             */
            viewToModel:function (point) {
                if (this.dirty) {
                    this.setModelViewMatrix();
                }
                this.worldModelViewMatrixI = this.worldModelViewMatrix.getInverse();
                this.worldModelViewMatrixI.transformCoord(point);
                return point;
            },
            /**
             * Private
             * This method does the needed point transformations across an Actor hierarchy to devise
             * whether the parameter point coordinate lies inside the Actor.
             * @param point {CAAT.Math.Point}
             *
             * @return null if the point is not inside the Actor. The Actor otherwise.
             */
            findActorAtPosition:function (point) {
                if (this.scaleX===0 || this.scaleY===0) {
                    return null;
                }
                if (!this.visible || !this.mouseEnabled || !this.isInAnimationFrame(this.time)) {
                    return null;
                }

                this.modelViewMatrixI = this.modelViewMatrix.getInverse();
                this.modelViewMatrixI.transformCoord(point);
                return this.contains(point.x, point.y) ? this : null;
            },
            /**
             * Enables a default dragging routine for the Actor.
             * This default dragging routine allows to:
             *  <li>scale the Actor by pressing shift+drag
             *  <li>rotate the Actor by pressing control+drag
             *  <li>scale non uniformly by pressing alt+shift+drag
             *
             * @return this
             */
            enableDrag:function () {

                this.ax = 0;
                this.ay = 0;
                this.asx = 1;
                this.asy = 1;
                this.ara = 0;
                this.screenx = 0;
                this.screeny = 0;

                /**
                 * Mouse enter handler for default drag behavior.
                 * @param mouseEvent {CAAT.Event.MouseEvent}
                 *
                 * @ignore
                 */
                this.mouseEnter = function (mouseEvent) {
                    this.__d_ax = -1;
                    this.__d_ay = -1;
                    this.pointed = true;
                    CAAT.setCursor('move');
                };

                /**
                 * Mouse exit handler for default drag behavior.
                 * @param mouseEvent {CAAT.Event.MouseEvent}
                 *
                 * @ignore
                 */
                this.mouseExit = function (mouseEvent) {
                    this.__d_ax = -1;
                    this.__d_ay = -1;
                    this.pointed = false;
                    CAAT.setCursor('default');
                };

                /**
                 * Mouse move handler for default drag behavior.
                 * @param mouseEvent {CAAT.Event.MouseEvent}
                 *
                 * @ignore
                 */
                this.mouseMove = function (mouseEvent) {
                };

                /**
                 * Mouse up handler for default drag behavior.
                 * @param mouseEvent {CAAT.Event.MouseEvent}
                 *
                 * @ignore
                 */
                this.mouseUp = function (mouseEvent) {
                    this.__d_ax = -1;
                    this.__d_ay = -1;
                };

                /**
                 * Mouse drag handler for default drag behavior.
                 * @param mouseEvent {CAAT.Event.MouseEvent}
                 *
                 * @ignore
                 */
                this.mouseDrag = function (mouseEvent) {

                    var pt;

                    pt = this.modelToView(new CAAT.Math.Point(mouseEvent.x, mouseEvent.y));
                    this.parent.viewToModel(pt);

                    if (this.__d_ax === -1 || this.__d_ay === -1) {
                        this.__d_ax = pt.x;
                        this.__d_ay = pt.y;
                        this.__d_asx = this.scaleX;
                        this.__d_asy = this.scaleY;
                        this.__d_ara = this.rotationAngle;
                        this.__d_screenx = mouseEvent.screenPoint.x;
                        this.__d_screeny = mouseEvent.screenPoint.y;
                    }

                    if (mouseEvent.isShiftDown()) {
                        var scx = (mouseEvent.screenPoint.x - this.__d_screenx) / 100;
                        var scy = (mouseEvent.screenPoint.y - this.__d_screeny) / 100;
                        if (!mouseEvent.isAltDown()) {
                            var sc = Math.max(scx, scy);
                            scx = sc;
                            scy = sc;
                        }
                        this.setScale(scx + this.__d_asx, scy + this.__d_asy);

                    } else if (mouseEvent.isControlDown()) {
                        var vx = mouseEvent.screenPoint.x - this.__d_screenx;
                        var vy = mouseEvent.screenPoint.y - this.__d_screeny;
                        this.setRotation(-Math.atan2(vx, vy) + this.__d_ara);
                    } else {
                        this.x += pt.x - this.__d_ax;
                        this.y += pt.y - this.__d_ay;
                    }

                    this.__d_ax = pt.x;
                    this.__d_ay = pt.y;
                };

                return this;
            },
            disableDrag:function () {

                this.mouseEnter = function (mouseEvent) {
                };
                this.mouseExit = function (mouseEvent) {
                };
                this.mouseMove = function (mouseEvent) {
                };
                this.mouseUp = function (mouseEvent) {
                };
                this.mouseDrag = function (mouseEvent) {
                };

                return this;
            },
            /**
             * Default mouseClick handler.
             * Mouse click events are received after a call to mouseUp method if no dragging was in progress.
             *
             * @param mouseEvent {CAAT.Event.MouseEvent}
             */
            mouseClick:function (mouseEvent) {
            },
            /**
             * Default double click handler
             *
             * @param mouseEvent {CAAT.Event.MouseEvent}
             */
            mouseDblClick:function (mouseEvent) {
            },
            /**
             * Default mouse enter on Actor handler.
             * @param mouseEvent {CAAT.Event.MouseEvent}
             */
            mouseEnter:function (mouseEvent) {
                this.pointed = true;
            },
            /**
             * Default mouse exit on Actor handler.
             *
             * @param mouseEvent {CAAT.Event.MouseEvent}
             */
            mouseExit:function (mouseEvent) {
                this.pointed = false;
            },
            /**
             * Default mouse move inside Actor handler.
             *
             * @param mouseEvent {CAAT.Event.MouseEvent}
             */
            mouseMove:function (mouseEvent) {
            },
            /**
             * default mouse press in Actor handler.
             *
             * @param mouseEvent {CAAT.Event.MouseEvent}
             */
            mouseDown:function (mouseEvent) {
            },
            /**
             * default mouse release in Actor handler.
             *
             * @param mouseEvent {CAAT.Event.MouseEvent}
             */
            mouseUp:function (mouseEvent) {
            },
            mouseOut:function (mouseEvent) {
            },
            mouseOver:function (mouseEvent) {
            },
            /**
             * default Actor mouse drag handler.
             *
             * @param mouseEvent {CAAT.Event.MouseEvent}
             */
            mouseDrag:function (mouseEvent) {
            },
            /**
             * Draw a bounding box with on-screen coordinates regardless of the transformations
             * applied to the Actor.
             *
             * @param director {CAAT.Foundations.Director} object instance that contains the Scene the Actor is in.
             * @param time {number} integer indicating the Scene time when the bounding box is to be drawn.
             */
            drawScreenBoundingBox:function (director, time) {
                if (null !== this.AABB && this.inFrame) {
                    var s = this.AABB;
                    var ctx = director.ctx;
                    ctx.strokeStyle = CAAT.DEBUGAABBCOLOR;
                    ctx.strokeRect(.5 + (s.x | 0), .5 + (s.y | 0), s.width | 0, s.height | 0);
                    if (CAAT.DEBUGBB) {
                        var vv = this.viewVertices;
                        ctx.beginPath();
                        ctx.lineTo(vv[0].x, vv[0].y);
                        ctx.lineTo(vv[1].x, vv[1].y);
                        ctx.lineTo(vv[2].x, vv[2].y);
                        ctx.lineTo(vv[3].x, vv[3].y);
                        ctx.closePath();
                        ctx.strokeStyle = CAAT.DEBUGBBCOLOR;
                        ctx.stroke();
                    }
                }
            },
            /**
             * Private
             * This method is called by the Director instance.
             * It applies the list of behaviors the Actor has registered.
             *
             * @param director the CAAT.Foundation.Director object instance that contains the Scene the Actor is in.
             * @param time an integer indicating the Scene time when the bounding box is to be drawn.
             */
            animate:function (director, time) {

                if (!this.visible) {
                    return false;
                }

                var i;

                if (!this.isInAnimationFrame(time)) {
                    this.inFrame = false;
                    this.dirty = true;
                    return false;
                }

                if (this.x !== this.oldX || this.y !== this.oldY) {
                    this.dirty = true;
                    this.oldX = this.x;
                    this.oldY = this.y;
                }

                for (i = 0; i < this.behaviorList.length; i++) {
                    this.behaviorList[i].apply(time, this);
                }

                if (this.clipPath) {
                    this.clipPath.applyBehaviors(time);
                }

                // transformation stuff.
                this.setModelViewMatrix();

                if (this.dirty || this.wdirty || this.invalid) {
                    if (director.dirtyRectsEnabled) {
                        director.addDirtyRect(this.AABB);
                    }
                    this.setScreenBounds();
                    if (director.dirtyRectsEnabled) {
                        director.addDirtyRect(this.AABB);
                    }
                }
                this.dirty = false;
                this.invalid = false;

                this.inFrame = true;

                if ( this.backgroundImage ) {
                    this.backgroundImage.setSpriteIndexAtTime(time);
                }

                return this.AABB.intersects(director.AABB);
                //return true;
            },
            /**
             * Set this model view matrix if the actor is Dirty.
             *
             mm[2]+= this.x;
             mm[5]+= this.y;
             if ( this.rotationAngle ) {
                 this.modelViewMatrix.multiply( m.setTranslate( this.rotationX, this.rotationY) );
                 this.modelViewMatrix.multiply( m.setRotation( this.rotationAngle ) );
                 this.modelViewMatrix.multiply( m.setTranslate( -this.rotationX, -this.rotationY) );                    c= Math.cos( this.rotationAngle );
             }
             if ( this.scaleX!=1 || this.scaleY!=1 && (this.scaleTX || this.scaleTY )) {
                 this.modelViewMatrix.multiply( m.setTranslate( this.scaleTX , this.scaleTY ) );
                 this.modelViewMatrix.multiply( m.setScale( this.scaleX, this.scaleY ) );
                 this.modelViewMatrix.multiply( m.setTranslate( -this.scaleTX , -this.scaleTY ) );
             }
             *
             * @return this
             */
            setModelViewMatrix:function () {
                var c, s, _m00, _m01, _m10, _m11;
                var mm0, mm1, mm2, mm3, mm4, mm5;
                var mm;

                this.wdirty = false;
                mm = this.modelViewMatrix.matrix;

                if (this.dirty) {

                    mm0 = 1;
                    mm1 = 0;
                    //mm2= mm[2];
                    mm3 = 0;
                    mm4 = 1;
                    //mm5= mm[5];

                    mm2 = this.x - this.tAnchorX * this.width;
                    mm5 = this.y - this.tAnchorY * this.height;

                    if (this.rotationAngle) {

                        var rx = this.rotationX * this.width;
                        var ry = this.rotationY * this.height;

                        mm2 += mm0 * rx + mm1 * ry;
                        mm5 += mm3 * rx + mm4 * ry;

                        c = Math.cos(this.rotationAngle);
                        s = Math.sin(this.rotationAngle);
                        _m00 = mm0;
                        _m01 = mm1;
                        _m10 = mm3;
                        _m11 = mm4;
                        mm0 = _m00 * c + _m01 * s;
                        mm1 = -_m00 * s + _m01 * c;
                        mm3 = _m10 * c + _m11 * s;
                        mm4 = -_m10 * s + _m11 * c;

                        mm2 += -mm0 * rx - mm1 * ry;
                        mm5 += -mm3 * rx - mm4 * ry;
                    }
                    if (this.scaleX != 1 || this.scaleY != 1) {

                        var sx = this.scaleTX * this.width;
                        var sy = this.scaleTY * this.height;

                        mm2 += mm0 * sx + mm1 * sy;
                        mm5 += mm3 * sx + mm4 * sy;

                        mm0 = mm0 * this.scaleX;
                        mm1 = mm1 * this.scaleY;
                        mm3 = mm3 * this.scaleX;
                        mm4 = mm4 * this.scaleY;

                        mm2 += -mm0 * sx - mm1 * sy;
                        mm5 += -mm3 * sx - mm4 * sy;
                    }

                    mm[0] = mm0;
                    mm[1] = mm1;
                    mm[2] = mm2;
                    mm[3] = mm3;
                    mm[4] = mm4;
                    mm[5] = mm5;
                }

                if (this.parent) {


                    this.isAA = this.rotationAngle === 0 && this.scaleX === 1 && this.scaleY === 1 && this.parent.isAA;

                    if (this.dirty || this.parent.wdirty) {
                        this.worldModelViewMatrix.copy(this.parent.worldModelViewMatrix);
                        if (this.isAA) {
                            var mmm = this.worldModelViewMatrix.matrix;
                            mmm[2] += mm[2];
                            mmm[5] += mm[5];
                        } else {
                            this.worldModelViewMatrix.multiply(this.modelViewMatrix);
                        }
                        this.wdirty = true;
                    }

                } else {
                    if (this.dirty) {
                        this.wdirty = true;
                    }

                    this.worldModelViewMatrix.identity();
                    this.isAA = this.rotationAngle === 0 && this.scaleX === 1 && this.scaleY === 1;
                }


//if ( (CAAT.DEBUGAABB || glEnabled) && (this.dirty || this.wdirty ) ) {
                // screen bounding boxes will always be calculated.
                /*
                 if ( this.dirty || this.wdirty || this.invalid ) {
                 if ( director.dirtyRectsEnabled ) {
                 director.addDirtyRect( this.AABB );
                 }
                 this.setScreenBounds();
                 if ( director.dirtyRectsEnabled ) {
                 director.addDirtyRect( this.AABB );
                 }
                 }
                 this.dirty= false;
                 this.invalid= false;
                 */
            },
            /**
             * Calculates the 2D bounding box in canvas coordinates of the Actor.
             * This bounding box takes into account the transformations applied hierarchically for
             * each Scene Actor.
             *
             * @private
             *
             */
            setScreenBounds:function () {

                var AABB = this.AABB;
                var vv = this.viewVertices;
                var vvv, m, x, y, w, h;

                if (this.isAA) {
                    m = this.worldModelViewMatrix.matrix;
                    x = m[2];
                    y = m[5];
                    w = this.width;
                    h = this.height;
                    AABB.x = x;
                    AABB.y = y;
                    AABB.x1 = x + w;
                    AABB.y1 = y + h;
                    AABB.width = w;
                    AABB.height = h;

                    if (CAAT.GLRENDER) {
                        vvv = vv[0];
                        vvv.x = x;
                        vvv.y = y;
                        vvv = vv[1];
                        vvv.x = x + w;
                        vvv.y = y;
                        vvv = vv[2];
                        vvv.x = x + w;
                        vvv.y = y + h;
                        vvv = vv[3];
                        vvv.x = x;
                        vvv.y = y + h;
                    }

                    return this;
                }

                vvv = vv[0];
                vvv.x = 0;
                vvv.y = 0;
                vvv = vv[1];
                vvv.x = this.width;
                vvv.y = 0;
                vvv = vv[2];
                vvv.x = this.width;
                vvv.y = this.height;
                vvv = vv[3];
                vvv.x = 0;
                vvv.y = this.height;

                this.modelToView(this.viewVertices);

                var xmin = Number.MAX_VALUE, xmax = -Number.MAX_VALUE;
                var ymin = Number.MAX_VALUE, ymax = -Number.MAX_VALUE;

                vvv = vv[0];
                if (vvv.x < xmin) {
                    xmin = vvv.x;
                }
                if (vvv.x > xmax) {
                    xmax = vvv.x;
                }
                if (vvv.y < ymin) {
                    ymin = vvv.y;
                }
                if (vvv.y > ymax) {
                    ymax = vvv.y;
                }
                vvv = vv[1];
                if (vvv.x < xmin) {
                    xmin = vvv.x;
                }
                if (vvv.x > xmax) {
                    xmax = vvv.x;
                }
                if (vvv.y < ymin) {
                    ymin = vvv.y;
                }
                if (vvv.y > ymax) {
                    ymax = vvv.y;
                }
                vvv = vv[2];
                if (vvv.x < xmin) {
                    xmin = vvv.x;
                }
                if (vvv.x > xmax) {
                    xmax = vvv.x;
                }
                if (vvv.y < ymin) {
                    ymin = vvv.y;
                }
                if (vvv.y > ymax) {
                    ymax = vvv.y;
                }
                vvv = vv[3];
                if (vvv.x < xmin) {
                    xmin = vvv.x;
                }
                if (vvv.x > xmax) {
                    xmax = vvv.x;
                }
                if (vvv.y < ymin) {
                    ymin = vvv.y;
                }
                if (vvv.y > ymax) {
                    ymax = vvv.y;
                }

                AABB.x = xmin;
                AABB.y = ymin;
                AABB.x1 = xmax;
                AABB.y1 = ymax;
                AABB.width = (xmax - xmin);
                AABB.height = (ymax - ymin);

                return this;
            },
            /**
             * @private.
             * This method will be called by the Director to set the whole Actor pre-render process.
             *
             * @param director the CAAT.Foundation.Director object instance that contains the Scene the Actor is in.
             * @param time an integer indicating the Scene time when the bounding box is to be drawn.
             *
             * @return boolean indicating whether the Actor isInFrameTime
             */
            paintActor:function (director, time) {

                if (!this.visible || !director.inDirtyRect(this)) {
                    return true;
                }

                var ctx = director.ctx;

                this.frameAlpha = this.parent ? this.parent.frameAlpha * this.alpha : 1;
                ctx.globalAlpha = this.frameAlpha;

                director.modelViewMatrix.transformRenderingContextSet(ctx);
                this.worldModelViewMatrix.transformRenderingContext(ctx);

                if (this.clip) {
                    ctx.beginPath();
                    if (!this.clipPath) {
                        ctx.rect(0, 0, this.width, this.height);
                    } else {
                        this.clipPath.applyAsPath(director);
                    }
                    ctx.clip();
                }

                this.paint(director, time);

                return true;
            },
            /**
             * for js2native
             * @param director
             * @param time
             */
            __paintActor:function (director, time) {
                if (!this.visible) {
                    return true;
                }
                var ctx = director.ctx;

                // global opt: set alpha as owns alpha, not take globalAlpha procedure.
                this.frameAlpha = this.alpha;

                var m = this.worldModelViewMatrix.matrix;
                ctx.setTransform(m[0], m[3], m[1], m[4], m[2], m[5], this.frameAlpha);
                this.paint(director, time);
                return true;
            },

            /**
             * Set coordinates and uv values for this actor.
             * This function uses Director's coords and indexCoords values.
             * @param director
             * @param time
             */
            paintActorGL:function (director, time) {

                this.frameAlpha = this.parent.frameAlpha * this.alpha;

                if (!this.glEnabled || !this.visible) {
                    return;
                }

                if (this.glNeedsFlush(director)) {
                    director.glFlush();
                    this.glSetShader(director);

                    if (!this.__uv) {
                        this.__uv = new Float32Array(8);
                    }
                    if (!this.__vv) {
                        this.__vv = new Float32Array(12);
                    }

                    this.setGLCoords(this.__vv, 0);
                    this.setUV(this.__uv, 0);
                    director.glRender(this.__vv, 12, this.__uv);

                    return;
                }

                var glCoords = director.coords;
                var glCoordsIndex = director.coordsIndex;

                ////////////////// XYZ
                this.setGLCoords(glCoords, glCoordsIndex);
                director.coordsIndex = glCoordsIndex + 12;

                ////////////////// UV
                this.setUV(director.uv, director.uvIndex);
                director.uvIndex += 8;
            },
            /**
             * TODO: set GLcoords for different image transformations.
             *
             * @param glCoords
             * @param glCoordsIndex
             */
            setGLCoords:function (glCoords, glCoordsIndex) {

                var vv = this.viewVertices;
                glCoords[glCoordsIndex++] = vv[0].x;
                glCoords[glCoordsIndex++] = vv[0].y;
                glCoords[glCoordsIndex++] = 0;

                glCoords[glCoordsIndex++] = vv[1].x;
                glCoords[glCoordsIndex++] = vv[1].y;
                glCoords[glCoordsIndex++] = 0;

                glCoords[glCoordsIndex++] = vv[2].x;
                glCoords[glCoordsIndex++] = vv[2].y;
                glCoords[glCoordsIndex++] = 0;

                glCoords[glCoordsIndex++] = vv[3].x;
                glCoords[glCoordsIndex++] = vv[3].y;
                glCoords[glCoordsIndex  ] = 0;

            },
            /**
             * Set UV for this actor's quad.
             *
             * @param uvBuffer {Float32Array}
             * @param uvIndex {number}
             */
            setUV:function (uvBuffer, uvIndex) {
                this.backgroundImage.setUV(uvBuffer, uvIndex);
            },
            /**
             * Test for compulsory gl flushing:
             *  1.- opacity has changed.
             *  2.- texture page has changed.
             *
             */
            glNeedsFlush:function (director) {
                if (this.getTextureGLPage() !== director.currentTexturePage) {
                    return true;
                }
                if (this.frameAlpha !== director.currentOpacity) {
                    return true;
                }
                return false;
            },
            /**
             * Change texture shader program parameters.
             * @param director
             */
            glSetShader:function (director) {

                var tp = this.getTextureGLPage();
                if (tp !== director.currentTexturePage) {
                    director.setGLTexturePage(tp);
                }

                if (this.frameAlpha !== director.currentOpacity) {
                    director.setGLCurrentOpacity(this.frameAlpha);
                }
            },
            /**
             * @private.
             * This method is called after the Director has transformed and drawn a whole frame.
             *
             * @param director the CAAT.Foundation.Director object instance that contains the Scene the Actor is in.
             * @param time an integer indicating the Scene time when the bounding box is to be drawn.
             * @return this
             *
             * @deprecated
             */
            endAnimate:function (director, time) {
                return this;
            },
            initialize:function (overrides) {
                if (overrides) {
                    for (var i in overrides) {
                        this[i] = overrides[i];
                    }
                }

                return this;
            },
            /**
             * Set this Actor's clipping area.
             * @param enable {boolean} enable clip area.
             * @param clipPath {CAAT.Path.Path=} An optional path to apply clip with. If enabled and clipPath is not set,
             *  a rectangle will be used.
             */
            setClip:function (enable, clipPath) {
                this.clip = enable;
                this.clipPath = clipPath;
                return this;
            },

            isCached : function() {
                return this.cached;
            },

            stopCacheAsBitmap:function () {
                if (this.cached) {
                    this.backgroundImage = null;
                    this.cached = CAAT.Foundation.Actor.CACHE_NONE;
                }
            },

            /**
             *
             * @param time {Number=}
             * @param stragegy {CAAT.Foundation.Actor.CACHE_SIMPLE | CAAT.Foundation.Actor.CACHE_DEEP}
             * @return this
             */
            cacheAsBitmap:function (time, strategy) {

                if (this.width<=0 || this.height<=0 ) {
                    return this;
                }

                time = time || 0;
                var canvas = document.createElement('canvas');
                canvas.width = this.width;
                canvas.height = this.height;
                var ctx = canvas.getContext('2d');

                CAAT.Foundation.Actor.prototype.animate.call(this,CAAT.currentDirector,time);

                var director = {
                    ctx:ctx,
                    modelViewMatrix: new CAAT.Math.Matrix(),
                    worldModelViewMatrix: new CAAT.Math.Matrix(),
                    dirtyRectsEnabled:false,
                    inDirtyRect:function () {
                        return true;
                    },
                    AABB : new CAAT.Math.Rectangle(0,0,this.width,this.height)
                };

                var pmv = this.modelViewMatrix;
                var pwmv = this.worldModelViewMatrix;

                this.modelViewMatrix = new CAAT.Math.Matrix();
                this.worldModelViewMatrix = new CAAT.Math.Matrix();

                this.cached = CAAT.Foundation.Actor.CACHE_NONE;

                if ( typeof strategy==="undefined" ) {
                    strategy= CAAT.Foundation.Actor.CACHE_SIMPLE;
                }
                if ( strategy===CAAT.Foundation.Actor.CACHE_DEEP ) {
                    this.animate(director, time );
                    this.paintActor(director, time);
                } else {
                    if ( this instanceof CAAT.Foundation.ActorContainer || this instanceof CAAT.ActorContainer ) {
                        CAAT.Foundation.ActorContainer.superclass.paintActor.call(this, director, time);
                    } else {
                        this.animate(director, time );
                        this.paintActor(director, time);
                    }
                }
                this.setBackgroundImage(canvas);

                this.cached = strategy;

                this.modelViewMatrix = pmv;
                this.worldModelViewMatrix = pwmv;

                return this;
            },
            resetAsButton : function() {
                this.actionPerformed= null;
                this.mouseEnter=    function() {};
                this.mouseExit=     function() {};
                this.mouseDown=     function() {};
                this.mouseUp=       function() {};
                this.mouseClick=    function() {};
                this.mouseDrag=     function() {};
                return this;
            },
            /**
             * Set this actor behavior as if it were a Button. The actor size will be set as SpriteImage's
             * single size.
             *
             * @param buttonImage {CAAT.Foundation.SpriteImage} sprite image with button's state images.
             * @param iNormal {number} button's normal state image index
             * @param iOver {number} button's mouse over state image index
             * @param iPress {number} button's pressed state image index
             * @param iDisabled {number} button's disabled state image index
             * @param fn {function(button{CAAT.Foundation.Actor})} callback function
             */
            setAsButton:function (buttonImage, iNormal, iOver, iPress, iDisabled, fn) {

                var me = this;

                this.setBackgroundImage(buttonImage, true);

                this.iNormal = iNormal || 0;
                this.iOver = iOver || this.iNormal;
                this.iPress = iPress || this.iNormal;
                this.iDisabled = iDisabled || this.iNormal;
                this.fnOnClick = fn;
                this.enabled = true;

                this.setSpriteIndex(iNormal);

                /**
                 * Enable or disable the button.
                 * @param enabled {boolean}
                 * @ignore
                 */
                this.setEnabled = function (enabled) {
                    this.enabled = enabled;
                    this.setSpriteIndex(this.enabled ? this.iNormal : this.iDisabled);
                    return this;
                };

                /**
                 * This method will be called by CAAT *before* the mouseUp event is fired.
                 * @param event {CAAT.Event.MouseEvent}
                 * @ignore
                 */
                this.actionPerformed = function (event) {
                    if (this.enabled && this.fnOnClick) {
                        this.fnOnClick(this);
                    }
                };

                /**
                 * Button's mouse enter handler. It makes the button provide visual feedback
                 * @param mouseEvent {CAAT.Event.MouseEvent}
                 * @ignore
                 */
                this.mouseEnter = function (mouseEvent) {
                    if (!this.enabled) {
                        return;
                    }

                    if (this.dragging) {
                        this.setSpriteIndex(this.iPress);
                    } else {
                        this.setSpriteIndex(this.iOver);
                    }
                    CAAT.setCursor('pointer');
                };

                /**
                 * Button's mouse exit handler. Release visual apperance.
                 * @param mouseEvent {CAAT.MouseEvent}
                 * @ignore
                 */
                this.mouseExit = function (mouseEvent) {
                    if (!this.enabled) {
                        return;
                    }

                    this.setSpriteIndex(this.iNormal);
                    CAAT.setCursor('default');
                };

                /**
                 * Button's mouse down handler.
                 * @param mouseEvent {CAAT.MouseEvent}
                 * @ignore
                 */
                this.mouseDown = function (mouseEvent) {
                    if (!this.enabled) {
                        return;
                    }

                    this.setSpriteIndex(this.iPress);
                };

                /**
                 * Button's mouse up handler.
                 * @param mouseEvent {CAAT.MouseEvent}
                 * @ignore
                 */
                this.mouseUp = function (mouseEvent) {
                    if (!this.enabled) {
                        return;
                    }

                    this.setSpriteIndex(this.iNormal);
                    this.dragging = false;
                };

                /**
                 * Button's mouse click handler. Do nothing by default. This event handler will be
                 * called ONLY if it has not been drag on the button.
                 * @param mouseEvent {CAAT.MouseEvent}
                 * @ignore
                 */
                this.mouseClick = function (mouseEvent) {
                };

                /**
                 * Button's mouse drag handler.
                 * @param mouseEvent {CAAT.MouseEvent}
                 * @ignore
                 */
                this.mouseDrag = function (mouseEvent) {
                    if (!this.enabled) {
                        return;
                    }

                    this.dragging = true;
                };

                this.setButtonImageIndex = function (_normal, _over, _press, _disabled) {
                    this.iNormal = _normal || 0;
                    this.iOver = _over || this.iNormal;
                    this.iPress = _press || this.iNormal;
                    this.iDisabled = _disabled || this.iNormal;
                    this.setSpriteIndex(this.iNormal);
                    return this;
                };

                return this;
            },

            findActorById : function(id) {
                return this.id===id ? this : null;
            }
        }
    }
});
CAAT.Module({

    /**
     * @name ActorContainer
     * @memberOf CAAT.Foundation
     * @extends CAAT.Foundation.Actor
     * @constructor
     */

    /**
     * @name ADDHINT
     * @memberOf CAAT.Foundation.ActorContainer
     * @namespace
     */

    /**
     * @name AddHint
     * @memberOf CAAT.Foundation.ActorContainer
     * @namespace
     * @deprecated
     */

    defines:"CAAT.Foundation.ActorContainer",
    aliases:["CAAT.ActorContainer"],
    depends:[
        "CAAT.Foundation.Actor",
        "CAAT.Math.Point",
        "CAAT.Math.Rectangle"
    ],
    constants :  {

        /**
         * @lends CAAT.Foundation.ActorContainer
         * */

        ADDHINT:{

            /**
             * @lends CAAT.Foundation.ActorContainer.ADDHINT
             */

            /** @const */ CONFORM:1
        },

        AddHint : {

            /**
             * @lends CAAT.Foundation.ActorContainer.AddHint
             */
            /** @const */ CONFORM:1
        }
    },
    extendsClass : "CAAT.Foundation.Actor",
    extendsWith : function () {



        var __CD =                      CAAT.Foundation.Actor.CACHE_DEEP;

        var sc=                         CAAT.Foundation.ActorContainer.superclass;
        var sc_drawScreenBoundingBox=   sc.drawScreenBoundingBox;
        var sc_paintActor=              sc.paintActor;
        var sc_paintActorGL=            sc.paintActorGL;
        var sc_animate=                 sc.animate;
        var sc_findActorAtPosition =    sc.findActorAtPosition;
        var sc_destroy =                sc.destroy;

        return {

            /**
             *
             * @lends CAAT.Foundation.ActorContainer.prototype
             */

            /**
             * Constructor delegate
             * @param hint {CAAT.Foundation.ActorContainer.AddHint}
             * @return {*}
             * @private
             */
            __init:function (hint) {

                this.__super();

                this.childrenList = [];
                this.activeChildren = [];
                this.pendingChildrenList = [];
                if (typeof hint !== 'undefined') {
                    this.addHint = hint;
                    this.boundingBox = new CAAT.Math.Rectangle();
                }
                return this;
            },

            /**
             * This container children.
             * @type {Array.<CAAT.Foundation.Actor>}
             */
            childrenList:null,

            /**
             * This container active children.
             * @type {Array.<CAAT.Foundation.Actor>}
             * @private
             */
            activeChildren:null,

            /**
             * This container pending to be added children.
             * @type {Array.<CAAT.Foundation.Actor>}
             * @private
             */
            pendingChildrenList:null,

            /**
             * Container redimension policy when adding children:
             *  0 : no resize.
             *  CAAT.Foundation.ActorContainer.AddHint.CONFORM : resize container to a bounding box.
             *
             * @type {number}
             * @private
             */
            addHint:0,

            /**
             * If container redimension on children add, use this rectangle as bounding box store.
             * @type {CAAT.Math.Rectangle}
             * @private
             */
            boundingBox:null,

            /**
             * Spare rectangle to avoid new allocations when adding children to this container.
             * @type {CAAT.Math.Rectangle}
             * @private
             */
            runion:new CAAT.Math.Rectangle(), // Watch out. one for every container.

            /**
             * Define a layout manager for this container that enforces children position and/or sizes.
             * @see demo26 for an example of layouts.
             * @type {CAAT.Foundation.UI.Layout.LayoutManager}
             */
            layoutManager:null, // a layout manager instance.

            /**
             * @type {boolean}
             */
            layoutInvalidated:true,

            setLayout:function (layout) {
                this.layoutManager = layout;
                return this;
            },

            setBounds:function (x, y, w, h) {
                CAAT.Foundation.ActorContainer.superclass.setBounds.call(this, x, y, w, h);
                if (CAAT.currentDirector && !CAAT.currentDirector.inValidation) {
                    this.invalidateLayout();
                }
                return this;
            },

            __validateLayout:function () {

                this.__validateTree();
                this.layoutInvalidated = false;
            },

            __validateTree:function () {
                if (this.layoutManager && this.layoutManager.isInvalidated()) {

                    CAAT.currentDirector.inValidation = true;

                    this.layoutManager.doLayout(this);

                    for (var i = 0; i < this.getNumChildren(); i += 1) {
                        this.getChildAt(i).__validateLayout();
                    }
                }
            },

            invalidateLayout:function () {
                this.layoutInvalidated = true;

                if (this.layoutManager) {
                    this.layoutManager.invalidateLayout(this);

                    for (var i = 0; i < this.getNumChildren(); i += 1) {
                        this.getChildAt(i).invalidateLayout();
                    }
                }
            },

            getLayout:function () {
                return this.layoutManager;
            },

            /**
             * Draws this ActorContainer and all of its children screen bounding box.
             *
             * @param director the CAAT.Foundation.Director object instance that contains the Scene the Actor is in.
             * @param time an integer indicating the Scene time when the bounding box is to be drawn.
             */
            drawScreenBoundingBox:function (director, time) {

                if (!this.inFrame) {
                    return;
                }

                var cl = this.activeChildren;
                for (var i = 0; i < cl.length; i++) {
                    cl[i].drawScreenBoundingBox(director, time);
                }
                sc_drawScreenBoundingBox.call(this, director, time);
            },
            /**
             * Removes all children from this ActorContainer.
             *
             * @return this
             */
            emptyChildren:function () {
                this.childrenList = [];

                return this;
            },
            /**
             * Private
             * Paints this container and every contained children.
             *
             * @param director the CAAT.Foundation.Director object instance that contains the Scene the Actor is in.
             * @param time an integer indicating the Scene time when the bounding box is to be drawn.
             */
            paintActor:function (director, time) {

                if (!this.visible) {
                    return false;
                }

                var ctx = director.ctx;

                ctx.save();

                if (!sc_paintActor.call(this, director, time)) {
                    return false;
                }

                if (this.cached === __CD) {
                    return false;
                }

                if (!this.isGlobalAlpha) {
                    this.frameAlpha = this.parent ? this.parent.frameAlpha : 1;
                }

                for (var i = 0, l = this.activeChildren.length; i < l; ++i) {
                    var actor = this.activeChildren[i];

                    if (actor.visible) {
                        ctx.save();
                        actor.paintActor(director, time);
                        ctx.restore();
                    }
                }

                if (this.postPaint) {
                    this.postPaint( director, time );
                }

                ctx.restore();

                return true;
            },
            __paintActor:function (director, time) {
                if (!this.visible) {
                    return true;
                }

                var ctx = director.ctx;

                this.frameAlpha = this.parent ? this.parent.frameAlpha * this.alpha : 1;
                var m = this.worldModelViewMatrix.matrix;
                ctx.setTransform(m[0], m[3], m[1], m[4], m[2], m[5], this.frameAlpha);
                this.paint(director, time);

                if (!this.isGlobalAlpha) {
                    this.frameAlpha = this.parent ? this.parent.frameAlpha : 1;
                }

                for (var i = 0, l = this.activeChildren.length; i < l; ++i) {
                    var actor = this.activeChildren[i];
                    actor.paintActor(director, time);
                }
                return true;
            },
            paintActorGL:function (director, time) {

                var i, l, c;

                if (!this.visible) {
                    return true;
                }

                sc_paintActorGL.call(this, director, time);

                if (!this.isGlobalAlpha) {
                    this.frameAlpha = this.parent.frameAlpha;
                }

                for (i = 0, l = this.activeChildren.length; i < l; ++i) {
                    c = this.activeChildren[i];
                    c.paintActorGL(director, time);
                }

            },
            /**
             * Private.
             * Performs the animate method for this ActorContainer and every contained Actor.
             *
             * @param director the CAAT.Foundation.Director object instance that contains the Scene the Actor is in.
             * @param time an integer indicating the Scene time when the bounding box is to be drawn.
             *
             * @return {boolean} is this actor in active children list ??
             */
            animate:function (director, time) {

                if (!this.visible) {
                    return false;
                }

                this.activeChildren = [];
                var last = null;

                if (false === sc_animate.call(this, director, time)) {
                    return false;
                }

                if (this.cached === __CD) {
                    return true;
                }

                this.__validateLayout();
                CAAT.currentDirector.inValidation = false;

                var i, l;

                /**
                 * Incluir los actores pendientes.
                 * El momento es ahora, antes de procesar ninguno del contenedor.
                 */
                var pcl = this.pendingChildrenList;
                for (i = 0; i < pcl.length; i++) {
                    var child = pcl[i];
                    this.addChildImmediately(child.child, child.constraint);
                }

                this.pendingChildrenList = [];
                var markDelete = [];

                var cl = this.childrenList;
                this.size_active = 1;
                this.size_total = 1;
                for (i = 0; i < cl.length; i++) {
                    var actor = cl[i];
                    actor.time = time;
                    this.size_total += actor.size_total;
                    if (actor.animate(director, time)) {
                        this.activeChildren.push(actor);
                        this.size_active += actor.size_active;
                    } else {
                        if (actor.expired && actor.discardable) {
                            markDelete.push(actor);
                        }
                    }
                }

                for (i = 0, l = markDelete.length; i < l; i++) {
                    var md = markDelete[i];
                    md.destroy(time);
                    if (director.dirtyRectsEnabled) {
                        director.addDirtyRect(md.AABB);
                    }
                }

                return true;
            },
            /**
             * Removes Actors from this ActorContainer which are expired and flagged as Discardable.
             *
             * @param director the CAAT.Foundation.Director object instance that contains the Scene the Actor is in.
             * @param time an integer indicating the Scene time when the bounding box is to be drawn.
             *
             * @deprecated
             */
            endAnimate:function (director, time) {
            },
            /**
             * Adds an Actor to this Container.
             * The Actor will be added ON METHOD CALL, despite the rendering pipeline stage being executed at
             * the time of method call.
             *
             * This method is only used by director's transitionScene.
             *
             * @param child {CAAT.Foundation.Actor}
             * @param constraint {object}
             * @return this.
             */
            addChildImmediately:function (child, constraint) {
                return this.addChild(child, constraint);
            },

            addActorImmediately: function(child,constraint) {
                return this.addChildImmediately(child,constraint);
            },

            addActor : function( child, constraint ) {
                return this.addChild(child,constraint);
            },

            /**
             * Adds an Actor to this ActorContainer.
             * The Actor will be added to the container AFTER frame animation, and not on method call time.
             * Except the Director and in orther to avoid visual artifacts, the developer SHOULD NOT call this
             * method directly.
             *
             * If the container has addingHint as CAAT.Foundation.ActorContainer.AddHint.CONFORM, new continer size will be
             * calculated by summing up the union of every client actor bounding box.
             * This method will not take into acount actor's affine transformations, so the bounding box will be
             * AABB.
             *
             * @param child {CAAT.Foundation.Actor} object instance.
             * @param constraint {object}
             * @return this
             */
            addChild:function (child, constraint) {

                if (child.parent != null) {
                    throw('adding to a container an element with parent.');
                }

                child.parent = this;
                this.childrenList.push(child);
                child.dirty = true;

                if (this.layoutManager) {
                    this.layoutManager.addChild(child, constraint);
                    this.invalidateLayout();
                } else {
                    /**
                     * if Conforming size, recalc new bountainer size.
                     */
                    if (this.addHint === CAAT.Foundation.ActorContainer.AddHint.CONFORM) {
                        this.recalcSize();
                    }
                }

                return this;
            },

            /**
             * Recalc this container size by computing the union of every children bounding box.
             */
            recalcSize:function () {
                var bb = this.boundingBox;
                bb.setEmpty();
                var cl = this.childrenList;
                var ac;
                for (var i = 0; i < cl.length; i++) {
                    ac = cl[i];
                    this.runion.setBounds(
                        ac.x < 0 ? 0 : ac.x,
                        ac.y < 0 ? 0 : ac.y,
                        ac.width,
                        ac.height);
                    bb.unionRectangle(this.runion);
                }
                this.setSize(bb.x1, bb.y1);

                return this;
            },

            /**
             * Add a child element and make it active in the next frame.
             * @param child {CAAT.Foundation.Actor}
             */
            addChildDelayed:function (child, constraint) {
                this.pendingChildrenList.push({ child:child, constraint: constraint });
                return this;
            },
            /**
             * Adds an Actor to this ActorContainer.
             *
             * @param child {CAAT.Foundation.Actor}.
             * @param index {number}
             *
             * @return this
             */
            addChildAt:function (child, index) {

                if (index <= 0) {
                    child.parent = this;
                    child.dirty = true;
                    this.childrenList.splice(0, 0, child);
                    this.invalidateLayout();
                    return this;
                } else {
                    if (index >= this.childrenList.length) {
                        index = this.childrenList.length;
                    }
                }

                child.parent = this;
                child.dirty = true;
                this.childrenList.splice(index, 0, child);
                this.invalidateLayout();

                return this;
            },
            /**
             * Find the first actor with the supplied ID.
             * This method is not recommended to be used since executes a linear search.
             * @param id
             */
            findActorById:function (id) {

                if ( CAAT.Foundation.ActorContainer.superclass.findActorById.call(this,id) ) {
                    return this;
                }

                var cl = this.childrenList;
                for (var i = 0, l = cl.length; i < l; i++) {
                    var ret= cl[i].findActorById(id);
                    if (null!=ret) {
                        return ret;
                    }
                }

                return null;
            },
            /**
             * Private
             * Gets a contained Actor z-index on this ActorContainer.
             *
             * @param child a CAAT.Foundation.Actor object instance.
             *
             * @return {number}
             */
            findChild:function (child) {
                var cl = this.childrenList;
                var i;
                var len = cl.length;

                for (i = 0; i < len; i++) {
                    if (cl[i] === child) {
                        return i;
                    }
                }
                return -1;
            },
            removeChildAt:function (pos) {
                var cl = this.childrenList;
                var rm;
                if (-1 !== pos && pos>=0 && pos<this.childrenList.length) {
                    cl[pos].setParent(null);
                    rm = cl.splice(pos, 1);
                    if (rm[0].isVisible() && CAAT.currentDirector.dirtyRectsEnabled) {
                        CAAT.currentDirector.scheduleDirtyRect(rm[0].AABB);
                    }

                    this.invalidateLayout();
                    return rm[0];
                }

                return null;
            },
            /**
             * Removed an Actor form this ActorContainer.
             * If the Actor is not contained into this Container, nothing happends.
             *
             * @param child a CAAT.Foundation.Actor object instance.
             *
             * @return this
             */
            removeChild:function (child) {
                var pos = this.findChild(child);
                var ret = this.removeChildAt(pos);

                return ret;
            },
            removeFirstChild:function () {
                var first = this.childrenList.shift();
                first.parent = null;
                if (first.isVisible() && CAAT.currentDirector.dirtyRectsEnabled) {
                    CAAT.currentDirector.scheduleDirtyRect(first.AABB);
                }

                this.invalidateLayout();

                return first;
            },
            removeLastChild:function () {
                if (this.childrenList.length) {
                    var last = this.childrenList.pop();
                    last.parent = null;
                    if (last.isVisible() && CAAT.currentDirector.dirtyRectsEnabled) {
                        CAAT.currentDirector.scheduleDirtyRect(last.AABB);
                    }

                    this.invalidateLayout();

                    return last;
                }

                return null;
            },
            /**
             * @private
             *
             * Gets the Actor inside this ActorContainer at a given Screen coordinate.
             *
             * @param point an object of the form { x: float, y: float }
             *
             * @return the Actor contained inside this ActorContainer if found, or the ActorContainer itself.
             */
            findActorAtPosition:function (point) {

                if (null === sc_findActorAtPosition.call(this, point)) {
                    return null;
                }

                // z-order
                var cl = this.childrenList;
                for (var i = cl.length - 1; i >= 0; i--) {
                    var child = this.childrenList[i];

                    var np = new CAAT.Math.Point(point.x, point.y, 0);
                    var contained = child.findActorAtPosition(np);
                    if (null !== contained) {
                        return contained;
                    }
                }

                return this;
            },
            /**
             * Destroys this ActorContainer.
             * The process falls down recursively for each contained Actor into this ActorContainer.
             *
             * @return this
             */
            destroy:function () {
                var cl = this.childrenList;
                for (var i = cl.length - 1; i >= 0; i--) {
                    cl[i].destroy();
                }
                sc_destroy.call(this);

                return this;
            },
            /**
             * Get number of Actors into this container.
             * @return integer indicating the number of children.
             */
            getNumChildren:function () {
                return this.childrenList.length;
            },
            getNumActiveChildren:function () {
                return this.activeChildren.length;
            },
            /**
             * Returns the Actor at the iPosition(th) position.
             * @param iPosition an integer indicating the position array.
             * @return the CAAT.Foundation.Actor object at position.
             */
            getChildAt:function (iPosition) {
                return this.childrenList[ iPosition ];
            },
            /**
             * Changes an actor's ZOrder.
             * @param actor the actor to change ZOrder for
             * @param index an integer indicating the new ZOrder. a value greater than children list size means to be the
             * last ZOrder Actor.
             */
            setZOrder:function (actor, index) {
                var actorPos = this.findChild(actor);
                // the actor is present
                if (-1 !== actorPos) {
                    var cl = this.childrenList;
                    // trivial reject.
                    if (index === actorPos) {
                        return;
                    }

                    if (index >= cl.length) {
                        cl.splice(actorPos, 1);
                        cl.push(actor);
                    } else {
                        var nActor = cl.splice(actorPos, 1);
                        if (index < 0) {
                            index = 0;
                        } else if (index > cl.length) {
                            index = cl.length;
                        }

                        cl.splice(index, 0, nActor[0]);
                    }

                    this.invalidateLayout();
                }
            }
        }

    }
});
/**
 * See LICENSE file.
 *
 */

CAAT.Module({

    /**
     * @name Scene
     * @memberOf CAAT.Foundation
     * @extends CAAT.Foundation.ActorContainer
     *
     * @constructor
     *
     */

    defines:"CAAT.Foundation.Scene",
    depends: [
        "CAAT.Math.Point",
        "CAAT.Math.Matrix",
        "CAAT.PathUtil.Path",
        "CAAT.Behavior.GenericBehavior",
        "CAAT.Behavior.ContainerBehavior",
        "CAAT.Behavior.ScaleBehavior",
        "CAAT.Behavior.AlphaBehavior",
        "CAAT.Behavior.RotateBehavior",
        "CAAT.Behavior.PathBehavior",
        "CAAT.Foundation.ActorContainer",
        "CAAT.Foundation.Timer.TimerManager"
    ],
    aliases:["CAAT.Scene"],
    extendsClass:"CAAT.Foundation.ActorContainer",
    constants:{
        /**
         * @lends  CAAT.Foundation.Scene
         */

        /** @const @type {number} */ EASE_ROTATION:1, // Constant values to identify the type of Scene transition
        /** @const @type {number} */ EASE_SCALE:2, // to perform on Scene switching by the Director.
        /** @const @type {number} */ EASE_TRANSLATE:3
    },
    extendsWith:function () {
        return {

            /**
             * @lends  CAAT.Foundation.Scene.prototype
             */

            __init:function () {
                this.__super();
                this.timerManager = new CAAT.TimerManager();
                this.fillStyle = null;
                this.isGlobalAlpha = true;
                return this;
            },

            /**
             * Behavior container used uniquely for Scene switching.
             * @type {CAAT.Behavior.ContainerBehavior}
             * @private
             */
            easeContainerBehaviour:null,

            /**
             * Array of container behaviour events observer.
             * @private
             */
            easeContainerBehaviourListener:null,

            /**
             * When Scene switching, this boolean identifies whether the Scene is being brought in, or taken away.
             * @type {boolean}
             * @private
             */
            easeIn:false,


            /**
             * is this scene paused ?
             * @type {boolean}
             * @private
             */
            paused:false,

            /**
             * This scene´s timer manager.
             * @type {CAAT.Foundation.Timer.TimerManager}
             * @private
             */
            timerManager:null,

            isPaused:function () {
                return this.paused;
            },

            setPaused:function (paused) {
                this.paused = paused;
            },

            createTimer:function (startTime, duration, callback_timeout, callback_tick, callback_cancel) {
                return this.timerManager.createTimer(startTime, duration, callback_timeout, callback_tick, callback_cancel, this);
            },

            setTimeout:function (duration, callback_timeout, callback_tick, callback_cancel) {
                return this.timerManager.createTimer(this.time, duration, callback_timeout, callback_tick, callback_cancel, this);
            },

            /**
             * Helper method to manage alpha transparency fading on Scene switch by the Director.
             * @param time {number} time in milliseconds then fading will taableIne.
             * @param isIn {boolean} whether this Scene is being brought in.
             *
             * @private
             */
            createAlphaBehaviour:function (time, isIn) {
                var ab = new CAAT.Behavior.AlphaBehavior();
                ab.setFrameTime(0, time);
                ab.startAlpha = isIn ? 0 : 1;
                ab.endAlpha = isIn ? 1 : 0;
                this.easeContainerBehaviour.addBehavior(ab);
            },
            /**
             * Called from CAAT.Director to bring in an Scene.
             * A helper method for easeTranslation.
             * @param time {number} time in milliseconds for the Scene to be brought in.
             * @param alpha {boolean} whether fading will be applied to the Scene.
             * @param anchor {number} Scene switch anchor.
             * @param interpolator {CAAT.Behavior.Interpolator} how to apply to the Scene transition.
             */
            easeTranslationIn:function (time, alpha, anchor, interpolator) {
                this.easeTranslation(time, alpha, anchor, true, interpolator);
            },
            /**
             * Called from CAAT.Director to bring in an Scene.
             * A helper method for easeTranslation.
             * @param time {number} time in milliseconds for the Scene to be taken away.
             * @param alpha {boolean} fading will be applied to the Scene.
             * @param anchor {number} Scene switch anchor.
             * @param interpolator {CAAT.Behavior.Interpolator} how to apply to the Scene transition.
             */
            easeTranslationOut:function (time, alpha, anchor, interpolator) {
                this.easeTranslation(time, alpha, anchor, false, interpolator);
            },
            /**
             * This method will setup Scene behaviours to switch an Scene via a translation.
             * The anchor value can only be
             *  <li>CAAT.Actor.ANCHOR_LEFT
             *  <li>CAAT.Actor.ANCHOR_RIGHT
             *  <li>CAAT.Actor.ANCHOR_TOP
             *  <li>CAAT.Actor.ANCHOR_BOTTOM
             * if any other value is specified, any of the previous ones will be applied.
             *
             * @param time {number} time in milliseconds for the Scene.
             * @param alpha {boolean} whether fading will be applied to the Scene.
             * @param anchor {numnber} Scene switch anchor.
             * @param isIn {boolean} whether the scene will be brought in.
             * @param interpolator {CAAT.Behavior.Interpolator} how to apply to the Scene transition.
             */
            easeTranslation:function (time, alpha, anchor, isIn, interpolator) {

                this.easeContainerBehaviour = new CAAT.Behavior.ContainerBehavior();
                this.easeIn = isIn;

                var pb = new CAAT.Behavior.PathBehavior();
                if (interpolator) {
                    pb.setInterpolator(interpolator);
                }

                pb.setFrameTime(0, time);

                // BUGBUG anchors: 1..4
                if (anchor < 1) {
                    anchor = 1;
                } else if (anchor > 4) {
                    anchor = 4;
                }


                switch (anchor) {
                    case CAAT.Foundation.Actor.ANCHOR_TOP:
                        if (isIn) {
                            pb.setPath(new CAAT.PathUtil.Path().setLinear(0, -this.height + 1, 0, 0));
                            this.setPosition(0,-this.height+1);
                        } else {
                            pb.setPath(new CAAT.PathUtil.Path().setLinear(0, 0, 0, -this.height + 1));
                            this.setPosition(0,0);
                        }
                        break;
                    case CAAT.Foundation.Actor.ANCHOR_BOTTOM:
                        if (isIn) {
                            pb.setPath(new CAAT.PathUtil.Path().setLinear(0, this.height - 1, 0, 0));
                            this.setPosition(0,this.height-1);
                        } else {
                            pb.setPath(new CAAT.PathUtil.Path().setLinear(0, 0, 0, this.height - 1));
                            this.setPosition(0,0);
                        }
                        break;
                    case CAAT.Foundation.Actor.ANCHOR_LEFT:
                        if (isIn) {
                            pb.setPath(new CAAT.PathUtil.Path().setLinear(-this.width + 1, 0, 0, 0));
                            this.setPosition(-this.width+1,0);
                        } else {
                            pb.setPath(new CAAT.PathUtil.Path().setLinear(0, 0, -this.width + 1, 0));
                            this.setPosition(0,0);
                        }
                        break;
                    case CAAT.Foundation.Actor.ANCHOR_RIGHT:
                        if (isIn) {
                            pb.setPath(new CAAT.PathUtil.Path().setLinear(this.width - 1, 0, 0, 0));
                            this.setPosition(this.width-1,0);
                        } else {
                            pb.setPath(new CAAT.PathUtil.Path().setLinear(0, 0, this.width - 1, 0));
                            this.setPosition(0,0);
                        }
                        break;
                }

                if (alpha) {
                    this.createAlphaBehaviour(time, isIn);
                }

                this.easeContainerBehaviour.addBehavior(pb);

                this.easeContainerBehaviour.setFrameTime(this.time, time);
                this.easeContainerBehaviour.addListener(this);

                this.emptyBehaviorList();
                CAAT.Foundation.Scene.superclass.addBehavior.call(this, this.easeContainerBehaviour);
            },
            /**
             * Called from CAAT.Foundation.Director to bring in a Scene.
             * A helper method for easeScale.
             * @param time {number} time in milliseconds for the Scene to be brought in.
             * @param alpha {boolean} whether fading will be applied to the Scene.
             * @param anchor {number} Scene switch anchor.
             * @param interpolator {CAAT.Behavior.Interpolator} how to apply to the Scene transition.
             * @param starttime {number} scene time milliseconds from which the behavior will be applied.
             */
            easeScaleIn:function (starttime, time, alpha, anchor, interpolator) {
                this.easeScale(starttime, time, alpha, anchor, true, interpolator);
                this.easeIn = true;
            },
            /**
             * Called from CAAT.Foundation.Director to take away a Scene.
             * A helper method for easeScale.
             * @param time {number} time in milliseconds for the Scene to be brought in.
             * @param alpha {boolean} whether fading will be applied to the Scene.
             * @param anchor {number} Scene switch anchor.
             * @param interpolator {CAAT.Behavior.Interpolator} how to apply to the Scene transition.
             * @param starttime {number} scene time milliseconds from which the behavior will be applied.
             **/
            easeScaleOut:function (starttime, time, alpha, anchor, interpolator) {
                this.easeScale(starttime, time, alpha, anchor, false, interpolator);
                this.easeIn = false;
            },
            /**
             * Called from CAAT.Foundation.Director to bring in ot take away an Scene.
             * @param time {number} time in milliseconds for the Scene to be brought in.
             * @param alpha {boolean} whether fading will be applied to the Scene.
             * @param anchor {number} Scene switch anchor.
             * @param interpolator {CAAT.Behavior.Interpolator} how to apply to the Scene transition.
             * @param starttime {number} scene time milliseconds from which the behavior will be applied.
             * @param isIn boolean indicating whether the Scene is being brought in.
             */
            easeScale:function (starttime, time, alpha, anchor, isIn, interpolator) {
                this.easeContainerBehaviour = new CAAT.Behavior.ContainerBehavior();

                var x = 0;
                var y = 0;
                var x2 = 0;
                var y2 = 0;

                switch (anchor) {
                    case CAAT.Foundation.Actor.ANCHOR_TOP_LEFT:
                    case CAAT.Foundation.Actor.ANCHOR_TOP_RIGHT:
                    case CAAT.Foundation.Actor.ANCHOR_BOTTOM_LEFT:
                    case CAAT.Foundation.Actor.ANCHOR_BOTTOM_RIGHT:
                    case CAAT.Foundation.Actor.ANCHOR_CENTER:
                        x2 = 1;
                        y2 = 1;
                        break;
                    case CAAT.Foundation.Actor.ANCHOR_TOP:
                    case CAAT.Foundation.Actor.ANCHOR_BOTTOM:
                        x = 1;
                        x2 = 1;
                        y = 0;
                        y2 = 1;
                        break;
                    case CAAT.Foundation.Actor.ANCHOR_LEFT:
                    case CAAT.Foundation.Actor.ANCHOR_RIGHT:
                        y = 1;
                        y2 = 1;
                        x = 0;
                        x2 = 1;
                        break;
                    default:
                        alert('scale anchor ?? ' + anchor);
                }

                if (!isIn) {
                    var tmp;
                    tmp = x;
                    x = x2;
                    x2 = tmp;

                    tmp = y;
                    y = y2;
                    y2 = tmp;
                }

                if (alpha) {
                    this.createAlphaBehaviour(time, isIn);
                }

                var anchorPercent = this.getAnchorPercent(anchor);
                var sb = new CAAT.Behavior.ScaleBehavior().
                    setFrameTime(starttime, time).
                    setValues(x, x2, y, y2, anchorPercent.x, anchorPercent.y);

                if (interpolator) {
                    sb.setInterpolator(interpolator);
                }

                this.easeContainerBehaviour.addBehavior(sb);

                this.easeContainerBehaviour.setFrameTime(this.time, time);
                this.easeContainerBehaviour.addListener(this);

                this.emptyBehaviorList();
                CAAT.Foundation.Scene.superclass.addBehavior.call(this, this.easeContainerBehaviour);
            },
            /**
             * Overriden method to disallow default behavior.
             * Do not use directly.
             */
            addBehavior:function (behaviour) {
                return this;
            },
            /**
             * Called from CAAT.Director to use Rotations for bringing in.
             * This method is a Helper for the method easeRotation.
             * @param time integer indicating time in milliseconds for the Scene to be brought in.
             * @param alpha boolean indicating whether fading will be applied to the Scene.
             * @param anchor integer indicating the Scene switch anchor.
             * @param interpolator {CAAT.Interpolator} a CAAT.Interpolator to apply to the Scene transition.
             */
            easeRotationIn:function (time, alpha, anchor, interpolator) {
                this.easeRotation(time, alpha, anchor, true, interpolator);
                this.easeIn = true;
            },
            /**
             * Called from CAAT.Director to use Rotations for taking Scenes away.
             * This method is a Helper for the method easeRotation.
             * @param time integer indicating time in milliseconds for the Scene to be taken away.
             * @param alpha boolean indicating whether fading will be applied to the Scene.
             * @param anchor integer indicating the Scene switch anchor.
             * @param interpolator {CAAT.Interpolator} a CAAT.Interpolator to apply to the Scene transition.
             */
            easeRotationOut:function (time, alpha, anchor, interpolator) {
                this.easeRotation(time, alpha, anchor, false, interpolator);
                this.easeIn = false;
            },
            /**
             * Called from CAAT.Director to use Rotations for taking away or bringing Scenes in.
             * @param time integer indicating time in milliseconds for the Scene to be taken away or brought in.
             * @param alpha boolean indicating whether fading will be applied to the Scene.
             * @param anchor integer indicating the Scene switch anchor.
             * @param interpolator {CAAT.Interpolator} a CAAT.Interpolator to apply to the Scene transition.
             * @param isIn boolean indicating whehter the Scene is brought in.
             */
            easeRotation:function (time, alpha, anchor, isIn, interpolator) {
                this.easeContainerBehaviour = new CAAT.Behavior.ContainerBehavior();

                var start = 0;
                var end = 0;

                if (anchor == CAAT.Foundation.Actor.ANCHOR_CENTER) {
                    anchor = CAAT.Foundation.Actor.ANCHOR_TOP;
                }

                switch (anchor) {
                    case CAAT.Foundation.Actor.ANCHOR_TOP:
                    case CAAT.Foundation.Actor.ANCHOR_BOTTOM:
                    case CAAT.Foundation.Actor.ANCHOR_LEFT:
                    case CAAT.Foundation.Actor.ANCHOR_RIGHT:
                        start = Math.PI * (Math.random() < 0.5 ? 1 : -1);
                        break;
                    case CAAT.Foundation.Actor.ANCHOR_TOP_LEFT:
                    case CAAT.Foundation.Actor.ANCHOR_TOP_RIGHT:
                    case CAAT.Foundation.Actor.ANCHOR_BOTTOM_LEFT:
                    case CAAT.Foundation.Actor.ANCHOR_BOTTOM_RIGHT:
                        start = Math.PI / 2 * (Math.random() < 0.5 ? 1 : -1);
                        break;
                    default:
                        alert('rot anchor ?? ' + anchor);
                }

                if (false === isIn) {
                    var tmp = start;
                    start = end;
                    end = tmp;
                }

                if (alpha) {
                    this.createAlphaBehaviour(time, isIn);
                }

                var anchorPercent = this.getAnchorPercent(anchor);
                var rb = new CAAT.Behavior.RotateBehavior().
                    setFrameTime(0, time).
                    setValues(start, end, anchorPercent.x, anchorPercent.y);

                if (interpolator) {
                    rb.setInterpolator(interpolator);
                }
                this.easeContainerBehaviour.addBehavior(rb);
                this.easeContainerBehaviour.setFrameTime(this.time, time);
                this.easeContainerBehaviour.addListener(this);

                this.emptyBehaviorList();
                CAAT.Foundation.Scene.superclass.addBehavior.call(this, this.easeContainerBehaviour);
            },
            /**
             * Registers a listener for listen for transitions events.
             * Al least, the Director registers himself as Scene easing transition listener.
             * When the transition is done, it restores the Scene's capability of receiving events.
             * @param listener {function(caat_behavior,time,actor)} an object which contains a method of the form <code>
             * behaviorExpired( caat_behaviour, time, actor);
             */
            setEaseListener:function (listener) {
                this.easeContainerBehaviourListener = listener;
            },
            /**
             * Private.
             * listener for the Scene's easeContainerBehaviour.
             * @param actor
             */
            behaviorExpired:function (actor) {
                this.easeContainerBehaviourListener.easeEnd(this, this.easeIn);
            },
            /**
             * This method should be overriden in case the developer wants to do some special actions when
             * the scene has just been brought in.
             */
            activated:function () {
            },
            /**
             * Scenes, do not expire the same way Actors do.
             * It simply will be set expired=true, but the frameTime won't be modified.
             */
            setExpired:function (bExpired) {
                this.expired = bExpired;
            },
            /**
             * An scene by default does not paint anything because has not fillStyle set.
             * @param director
             * @param time
             */
            paint:function (director, time) {

                if (this.fillStyle) {
                    var ctx = director.ctx;
                    ctx.fillStyle = this.fillStyle;
                    ctx.fillRect(0, 0, this.width, this.height);
                }
            },
            /**
             * Find a pointed actor at position point.
             * This method tries lo find the correctly pointed actor in two different ways.
             *  + first of all, if inputList is defined, it will look for an actor in it.
             *  + if no inputList is defined, it will traverse the scene graph trying to find a pointed actor.
             * @param point <CAAT.Point>
             */
            findActorAtPosition:function (point) {
                var i, j;

                var p = new CAAT.Math.Point();

                if (this.inputList) {
                    var il = this.inputList;
                    for (i = 0; i < il.length; i++) {
                        var ill = il[i];
                        for (j = 0; j < ill.length; j++) {
                            if ( ill[j].visible ) {
                                p.set(point.x, point.y);
                                var modelViewMatrixI = ill[j].worldModelViewMatrix.getInverse();
                                modelViewMatrixI.transformCoord(p);
                                if (ill[j].contains(p.x, p.y)) {
                                    return ill[j];
                                }
                            }
                        }
                    }
                }

                p.set(point.x, point.y);
                return CAAT.Foundation.Scene.superclass.findActorAtPosition.call(this, p);
            },

            /**
             * Enable a number of input lists.
             * These lists are set in case the developer doesn't want the to traverse the scene graph to find the pointed
             * actor. The lists are a shortcut whete the developer can set what actors to look for input at first instance.
             * The system will traverse the whole lists in order trying to find a pointed actor.
             *
             * Elements are added to each list either in head or tail.
             *
             * @param size <number> number of lists.
             */
            enableInputList:function (size) {
                this.inputList = [];
                for (var i = 0; i < size; i++) {
                    this.inputList.push([]);
                }

                return this;
            },

            /**
             * Add an actor to a given inputList.
             * @param actor <CAAT.Actor> an actor instance
             * @param index <number> the inputList index to add the actor to. This value will be clamped to the number of
             * available lists.
             * @param position <number> the position on the selected inputList to add the actor at. This value will be
             * clamped to the number of available lists.
             */
            addActorToInputList:function (actor, index, position) {
                if (index < 0) index = 0; else if (index >= this.inputList.length) index = this.inputList.length - 1;
                var il = this.inputList[index];

                if (typeof position === "undefined" || position >= il.length) {
                    il.push(actor);
                } else if (position <= 0) {
                    il.unshift(actor);
                } else {
                    il.splice(position, 0, actor);
                }

                return this;
            },

            /**
             * Remove all elements from an input list.
             * @param index <number> the inputList index to add the actor to. This value will be clamped to the number of
             * available lists so take care when emptying a non existant inputList index since you could end up emptying
             * an undesired input list.
             */
            emptyInputList:function (index) {
                if (index < 0) index = 0; else if (index >= this.inputList.length) index = this.inputList.length - 1;
                this.inputList[index] = [];
                return this;
            },

            /**
             * remove an actor from a given input list index.
             * If no index is supplied, the actor will be removed from every input list.
             * @param actor <CAAT.Actor>
             * @param index <!number> an optional input list index. This value will be clamped to the number of
             * available lists.
             */
            removeActorFromInputList:function (actor, index) {
                if (typeof index === "undefined") {
                    var i, j;
                    for (i = 0; i < this.inputList.length; i++) {
                        var il = this.inputList[i];
                        for (j = 0; j < il.length; j++) {
                            if (il[j] == actor) {
                                il.splice(j, 1);
                            }
                        }
                    }
                    return this;
                }

                if (index < 0) index = 0; else if (index >= this.inputList.length) index = this.inputList.length - 1;
                var il = this.inputList[index];
                for (j = 0; j < il.length; j++) {
                    if (il[j] == actor) {
                        il.splice(j, 1);
                    }
                }

                return this;
            },

            getIn : function( out_scene ) {

            },

            goOut : function( in_scene ) {

            }

        }
    }


});
/**
 * See LICENSE file.
 *
 **/

CAAT.Module({

    /**
     * @name Director
     * @memberOf CAAT.Foundation
     * @extends CAAT.Foundation.ActorContainer
     *
     * @constructor
     */

    defines:"CAAT.Foundation.Director",
    aliases:["CAAT.Director"],
    extendsClass:"CAAT.Foundation.ActorContainer",
    depends:[
        "CAAT.Core.Class",
        "CAAT.Core.Constants",

        "CAAT.Foundation.ActorContainer",
        "CAAT.Module.Audio.AudioManager",
        "CAAT.Module.Runtime.BrowserInfo",
        "CAAT.Module.Debug.Debug",
        "CAAT.Math.Point",
        "CAAT.Math.Rectangle",
        "CAAT.Math.Matrix",
        "CAAT.Foundation.Timer.TimerManager",
        "CAAT.Foundation.Actor",
        "CAAT.Foundation.Scene",
        "CAAT.Event.AnimationLoop",
        "CAAT.Event.Input",
        "CAAT.Event.KeyEvent",
        "CAAT.Event.MouseEvent",
        "CAAT.Event.TouchEvent",

        "CAAT.WebGL.Program",
        "CAAT.WebGL.ColorProgram",
        "CAAT.WebGL.TextureProgram",
        "CAAT.WebGL.GLU",

        "CAAT.Module.TexturePacker.TexturePageManager"
    ],
    constants:{
        /**
         * @lends  CAAT.Foundation.Director
         */

        /** @const @type {number} */ RENDER_MODE_CONTINUOUS:1, // redraw every frame
        /** @const @type {number} */ RENDER_MODE_DIRTY:2, // suitable for evented CAAT.

        /** @const @type {number} */ CLEAR_DIRTY_RECTS:1,
        /** @const @type {number} */ CLEAR_ALL:true,
        /** @const @type {number} */ CLEAR_NONE:false,

        /** @const @type {number} */ RESIZE_NONE:1,
        /** @const @type {number} */ RESIZE_WIDTH:2,
        /** @const @type {number} */ RESIZE_HEIGHT:4,
        /** @const @type {number} */ RESIZE_BOTH:8,
        /** @const @type {number} */ RESIZE_PROPORTIONAL:16
    },
    extendsWith:function () {
        return {

            /**
             * @lends  CAAT.Foundation.Director.prototype
             */

            __init:function () {
                this.__super();

                this.browserInfo = CAAT.Module.Runtime.BrowserInfo;
                this.audioManager = new CAAT.Module.Audio.AudioManager().initialize(8);
                this.scenes = [];
                this.imagesCache= [];

                // input related variables initialization
                this.mousePoint = new CAAT.Math.Point(0, 0, 0);
                this.prevMousePoint = new CAAT.Math.Point(0, 0, 0);
                this.screenMousePoint = new CAAT.Math.Point(0, 0, 0);
                this.isMouseDown = false;
                this.lastSelectedActor = null;
                this.dragging = false;

                this.cDirtyRects = [];
                this.sDirtyRects = [];
                this.dirtyRects = [];
                for (var i = 0; i < 64; i++) {
                    this.dirtyRects.push(new CAAT.Math.Rectangle());
                }
                this.dirtyRectsIndex = 0;
                this.touches = {};

                this.timerManager = new CAAT.Foundation.Timer.TimerManager();
                this.__map= {};

                return this;
            },

            /**
             * flag indicating debug mode. It will draw affedted screen areas.
             * @type {boolean}
             */
            debug:false,

            /**
             * Set CAAT render mode. Right now, this takes no effect.
             */
            renderMode:CAAT.Foundation.Director.RENDER_MODE_CONTINUOUS,

            /**
             * This method will be called before rendering any director scene.
             * Use this method to calculate your physics for example.
             * @private
             */
            onRenderStart:null,

            /**
             * This method will be called after rendering any director scene.
             * Use this method to clean your physics forces for example.
             * @private
             */
            onRenderEnd:null,

            // input related attributes
            /**
             * mouse coordinate related to canvas 0,0 coord.
             * @private
             */
            mousePoint:null,

            /**
             * previous mouse position cache. Needed for drag events.
             * @private
             */
            prevMousePoint:null,

            /**
             * screen mouse coordinates.
             * @private
             */
            screenMousePoint:null,

            /**
             * is the left mouse button pressed ?.
             * Needed to handle dragging.
             */
            isMouseDown:false,

            /**
             * director's last actor receiving input.
             * Needed to set capture for dragging events.
             */
            lastSelectedActor:null,

            /**
             * is input in drag mode ?
             */
            dragging:false,

            // other attributes

            /**
             * This director scene collection.
             * @type {Array.<CAAT.Foundation.Scene>}
             */
            scenes:null,

            /**
             * The current Scene. This and only this will receive events.
             */
            currentScene:null,

            /**
             * The canvas the Director draws on.
             * @private
             */
            canvas:null,

            /**
             * This director´s canvas rendering context.
             */
            ctx:null,

            /**
             * director time.
             * @private
             */
            time:0,

            /**
             * global director timeline.
             * @private
             */
            timeline:0,

            /**
             * An array of JSON elements of the form { id:string, image:Image }
             */
            imagesCache:null,

            /**
             * this director´s audio manager.
             * @private
             */
            audioManager:null,

            /**
             * Clear screen strategy:
             * CAAT.Foundation.Director.CLEAR_NONE : director won´t clear the background.
             * CAAT.Foundation.Director.CLEAR_DIRTY_RECTS : clear only affected actors screen area.
             * CAAT.Foundation.Director.CLEAR_ALL : clear the whole canvas object.
             */
            clear: CAAT.Foundation.Director.CLEAR_ALL,

            /**
             * if CAAT.CACHE_SCENE_ON_CHANGE is set, this scene will hold a cached copy of the exiting scene.
             * @private
             */
            transitionScene:null,

            /**
             * Some browser related information.
             */
            browserInfo:null,

            /**
             * 3d context
             * @private
             */
            gl:null,

            /**
             * is WebGL enabled as renderer ?
             * @private
             */
            glEnabled:false,

            /**
             * if webGL is on, CAAT will texture pack all images transparently.
             * @private
             */
            glTextureManager:null,

            /**
             * The only GLSL program for webGL
             * @private
             */
            glTtextureProgram:null,
            glColorProgram:null,

            /**
             * webGL projection matrix
             * @private
             */
            pMatrix:null, // projection matrix

            /**
             * webGL vertex array
             * @private
             */
            coords:null, // Float32Array

            /**
             * webGL vertex indices.
             * @private
             */
            coordsIndex:0,

            /**
             * webGL uv texture indices
             * @private
             */
            uv:null,
            uvIndex:0,

            /**
             * draw tris front_to_back or back_to_front ?
             * @private
             */
            front_to_back:false,

            /**
             * statistics object
             */
            statistics:{
                size_total:0,
                size_active:0,
                size_dirtyRects:0,
                draws:0,
                size_discarded_by_dirty_rects:0
            },

            /**
             * webGL current texture page. This minimizes webGL context changes.
             * @private
             */
            currentTexturePage:0,

            /**
             * webGL current shader opacity.
             * BUGBUG: change this by vertex colors.
             * @private
             */
            currentOpacity:1,

            /**
             * if CAAT.NO_RAF is set (no request animation frame), this value is the setInterval returned
             * id.
             * @private
             */
            intervalId:null,

            /**
             * Rendered frames counter.
             */
            frameCounter:0,

            /**
             * Window resize strategy.
             * see CAAT.Foundation.Director.RESIZE_* constants.
             * @private
             */
            resize:1,

            /**
             * Callback when the window is resized.
             */
            onResizeCallback:null,

            /**
             * Calculated gesture event scale.
             * @private
             */
            __gestureScale:0,

            /**
             * Calculated gesture event rotation.
             * @private
             */
            __gestureRotation:0,

            /**
             * Dirty rects cache.
             * An array of CAAT.Math.Rectangle object.
             * @private
             */
            dirtyRects:null, // dirty rects cache.

            /**
             * current dirty rects.
             * @private
             */
            cDirtyRects:null, // dirty rects cache.

            /**
             * Currently used dirty rects.
             * @private
             */
            sDirtyRects:null, // scheduled dirty rects.

            /**
             * Number of currently allocated dirty rects.
             * @private
             */
            dirtyRectsIndex:0,

            /**
             * Dirty rects enabled ??
             * @private
             */
            dirtyRectsEnabled:false,

            /**
             * Number of dirty rects.
             * @private
             */
            nDirtyRects:0,

            /**
             * Dirty rects count debug info.
             * @private
             */
            drDiscarded:0, // discarded by dirty rects.

            /**
             * Is this director stopped ?
             */
            stopped:false, // is stopped, this director will do nothing.

            /**
             * currently unused.
             * Intended to run caat in evented mode.
             * @private
             */
            needsRepaint:false,

            /**
             * Touches information. Associate touch.id with an actor and original touch info.
             * @private
             */
            touches:null,

            /**
             * Director´s timer manager.
             * Each scene has a timerManager as well.
             * The difference is the scope. Director´s timers will always be checked whereas scene´ timers
             * will only be scheduled/checked when the scene is director´ current scene.
             * @private
             */
            timerManager:null,

            /**
             * Retina display deicePixels/backingStorePixels ratio
             * @private
             */
            SCREEN_RATIO : 1,

            __map : null,

            clean:function () {
                this.scenes = null;
                this.currentScene = null;
                this.imagesCache = null;
                this.audioManager = null;
                this.isMouseDown = false;
                this.lastSelectedActor = null;
                this.dragging = false;
                this.__gestureScale = 0;
                this.__gestureRotation = 0;
                this.dirty = true;
                this.dirtyRects = null;
                this.cDirtyRects = null;
                this.dirtyRectsIndex = 0;
                this.dirtyRectsEnabled = false;
                this.nDirtyRects = 0;
                this.onResizeCallback = null;
                this.__map= {};
                return this;
            },

            cancelPlay : function(id) {
                return this.audioManager.cancelPlay(id);
            },

            cancelPlayByChannel : function(audioObject) {
                return this.audioManager.cancelPlayByChannel(audioObject);
            },

            setAudioFormatExtensions : function( extensions ) {
                this.audioManager.setAudioFormatExtensions(extensions);
                return this;
            },

            setValueForKey : function( key, value ) {
                this.__map[key]= value;
                return this;
            },

            getValueForKey : function( key ) {
                return this.__map[key];
                return this;
            },

            createTimer:function (startTime, duration, callback_timeout, callback_tick, callback_cancel) {
                return this.timerManager.createTimer(startTime, duration, callback_timeout, callback_tick, callback_cancel, this);
            },

            requestRepaint:function () {
                this.needsRepaint = true;
            },

            getCurrentScene:function () {
                return this.currentScene;
            },

            checkDebug:function () {
                if (!navigator.isCocoonJS && CAAT.DEBUG) {
                    var dd = new CAAT.Module.Debug.Debug().initialize(this.width, 60);
                    this.debugInfo = dd.debugInfo.bind(dd);
                }
            },
            getRenderType:function () {
                return this.glEnabled ? 'WEBGL' : 'CANVAS';
            },
            windowResized:function (w, h) {
                var c = CAAT.Foundation.Director;
                switch (this.resize) {
                    case c.RESIZE_WIDTH:
                        this.setBounds(0, 0, w, this.height);
                        break;
                    case c.RESIZE_HEIGHT:
                        this.setBounds(0, 0, this.width, h);
                        break;
                    case c.RESIZE_BOTH:
                        this.setBounds(0, 0, w, h);
                        break;
                    case c.RESIZE_PROPORTIONAL:
                        this.setScaleProportional(w, h);
                        break;
                }

                if (this.glEnabled) {
                    this.glReset();
                }

                if (this.onResizeCallback) {
                    this.onResizeCallback(this, w, h);
                }

            },
            setScaleProportional:function (w, h) {

                var factor = Math.min(w / this.referenceWidth, h / this.referenceHeight);

                this.canvas.width = this.referenceWidth * factor;
                this.canvas.height = this.referenceHeight * factor;
                this.ctx = this.canvas.getContext(this.glEnabled ? 'experimental-webgl' : '2d');

                this.__setupRetina();

                this.setScaleAnchored(factor * this.scaleX, factor * this.scaleY, 0, 0);
//                this.setScaleAnchored(factor, factor, 0, 0);

                if (this.glEnabled) {
                    this.glReset();
                }
            },
            /**
             * Enable window resize events and set redimension policy. A callback functio could be supplied
             * to be notified on a Director redimension event. This is necessary in the case you set a redim
             * policy not equal to RESIZE_PROPORTIONAL. In those redimension modes, director's area and their
             * children scenes are resized to fit the new area. But scenes content is not resized, and have
             * no option of knowing so uless an onResizeCallback function is supplied.
             *
             * @param mode {number}  RESIZE_BOTH, RESIZE_WIDTH, RESIZE_HEIGHT, RESIZE_NONE.
             * @param onResizeCallback {function(director{CAAT.Director}, width{integer}, height{integer})} a callback
             * to notify on canvas resize.
             */
            enableResizeEvents:function (mode, onResizeCallback) {
                var dd= CAAT.Foundation.Director;
                if (mode === dd.RESIZE_BOTH || mode === dd.RESIZE_WIDTH || mode === dd.RESIZE_HEIGHT || mode === dd.RESIZE_PROPORTIONAL) {
                    this.referenceWidth = this.width;
                    this.referenceHeight = this.height;
                    this.resize = mode;
                    CAAT.registerResizeListener(this);
                    this.onResizeCallback = onResizeCallback;
                    this.windowResized(window.innerWidth, window.innerHeight);
                } else {
                    CAAT.unregisterResizeListener(this);
                    this.onResizeCallback = null;
                }

                return this;
            },

            __setupRetina : function() {

                if ( CAAT.RETINA_DISPLAY_ENABLED ) {

                    // The world is full of opensource awesomeness.
                    //
                    // Source: http://www.html5rocks.com/en/tutorials/canvas/hidpi/
                    //
                    var devicePixelRatio= CAAT.Module.Runtime.BrowserInfo.DevicePixelRatio;
                    var backingStoreRatio = this.ctx.webkitBackingStorePixelRatio ||
                                            this.ctx.mozBackingStorePixelRatio ||
                                            this.ctx.msBackingStorePixelRatio ||
                                            this.ctx.oBackingStorePixelRatio ||
                                            this.ctx.backingStorePixelRatio ||
                                            1;

                    var ratio = devicePixelRatio / backingStoreRatio;

                    if (devicePixelRatio !== backingStoreRatio) {

                        var oldWidth = this.canvas.width;
                        var oldHeight = this.canvas.height;

                        this.canvas.width = oldWidth * ratio;
                        this.canvas.height = oldHeight * ratio;

                        this.canvas.style.width = oldWidth + 'px';
                        this.canvas.style.height = oldHeight + 'px';

                        this.setScaleAnchored( ratio, ratio, 0, 0 );
                    } else {
                        this.setScaleAnchored( 1, 1, 0, 0 );
                    }

                    this.SCREEN_RATIO= ratio;
                } else {
                    this.setScaleAnchored( 1, 1, 0, 0 );
                }

                for (var i = 0; i < this.scenes.length; i++) {
                    this.scenes[i].setBounds(0, 0, this.width, this.height);
                }
            },

            /**
             * Set this director's bounds as well as its contained scenes.
             * @param x {number} ignored, will be 0.
             * @param y {number} ignored, will be 0.
             * @param w {number} director width.
             * @param h {number} director height.
             *
             * @return this
             */
            setBounds:function (x, y, w, h) {

                CAAT.Foundation.Director.superclass.setBounds.call(this, x, y, w, h);

                if ( this.canvas.width!==w ) {
                    this.canvas.width = w;
                }

                if ( this.canvas.height!==h ) {
                    this.canvas.height = h;
                }

                this.ctx = this.canvas.getContext(this.glEnabled ? 'experimental-webgl' : '2d');

                this.__setupRetina();

                if (this.glEnabled) {
                    this.glReset();
                }

                return this;
            },
            /**
             * This method performs Director initialization. Must be called once.
             * If the canvas parameter is not set, it will create a Canvas itself,
             * and the developer must explicitly add the canvas to the desired DOM position.
             * This method will also set the Canvas dimension to the specified values
             * by width and height parameters.
             *
             * @param width {number} a canvas width
             * @param height {number} a canvas height
             * @param canvas {HTMLCanvasElement=} An optional Canvas object.
             * @param proxy {HTMLElement} this object can be an event proxy in case you'd like to layer different elements
             *              and want events delivered to the correct element.
             *
             * @return this
             */
            initialize:function (width, height, canvas, proxy) {
                if ( typeof canvas!=="undefined" ) {
                    if ( isString(canvas) ) {
                        canvas= document.getElementById(canvas);
                    } else if ( !(canvas instanceof HTMLCanvasElement ) ) {
                        console.log("Canvas is a: "+canvas+" ???");
                    }
                }

                if (!canvas) {
                    canvas = document.createElement('canvas');
                    document.body.appendChild(canvas);
                }

                this.canvas = canvas;

                if (typeof proxy === 'undefined') {
                    proxy = canvas;
                }

                this.setBounds(0, 0, width, height);
                this.enableEvents(proxy);

                this.timeline = new Date().getTime();

                // transition scene
                if (CAAT.CACHE_SCENE_ON_CHANGE) {
                    this.transitionScene = new CAAT.Foundation.Scene().setBounds(0, 0, width, height);
                    var transitionCanvas = document.createElement('canvas');
                    transitionCanvas.width = width;
                    transitionCanvas.height = height;
                    var transitionImageActor = new CAAT.Foundation.Actor().setBackgroundImage(transitionCanvas);
                    this.transitionScene.ctx = transitionCanvas.getContext('2d');
                    this.transitionScene.addChildImmediately(transitionImageActor);
                    this.transitionScene.setEaseListener(this);
                }

                this.checkDebug();

                return this;
            },
            glReset:function () {
                this.pMatrix = CAAT.WebGL.GLU.makeOrtho(0, this.referenceWidth, this.referenceHeight, 0, -1, 1);
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
                this.glColorProgram.setMatrixUniform(this.pMatrix);
                this.glTextureProgram.setMatrixUniform(this.pMatrix);
                this.gl.viewportWidth = this.canvas.width;
                this.gl.viewportHeight = this.canvas.height;
            },
            /**
             * Experimental.
             * Initialize a gl enabled director.
             */
            initializeGL:function (width, height, canvas, proxy) {

                if (!canvas) {
                    canvas = document.createElement('canvas');
                    document.body.appendChild(canvas);
                }

                canvas.width = width;
                canvas.height = height;

                if (typeof proxy === 'undefined') {
                    proxy = canvas;
                }

                this.referenceWidth = width;
                this.referenceHeight = height;

                var i;

                try {
                    this.gl = canvas.getContext("experimental-webgl"/*, {antialias: false}*/);
                    this.gl.viewportWidth = width;
                    this.gl.viewportHeight = height;
                    CAAT.GLRENDER = true;
                } catch (e) {
                }

                if (this.gl) {
                    this.canvas = canvas;
                    this.setBounds(0, 0, width, height);

                    this.enableEvents(canvas);
                    this.timeline = new Date().getTime();

                    this.glColorProgram = new CAAT.WebGL.ColorProgram(this.gl).create().initialize();
                    this.glTextureProgram = new CAAT.WebGL.TextureProgram(this.gl).create().initialize();
                    this.glTextureProgram.useProgram();
                    this.glReset();

                    var maxTris = 512;
                    this.coords = new Float32Array(maxTris * 12);
                    this.uv = new Float32Array(maxTris * 8);

                    this.gl.clearColor(0.0, 0.0, 0.0, 255);

                    if (this.front_to_back) {
                        this.gl.clearDepth(1.0);
                        this.gl.enable(this.gl.DEPTH_TEST);
                        this.gl.depthFunc(this.gl.LESS);
                    } else {
                        this.gl.disable(this.gl.DEPTH_TEST);
                    }

                    this.gl.enable(this.gl.BLEND);
// Fix FF                this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
                    this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
                    this.glEnabled = true;

                    this.checkDebug();
                } else {
                    // fallback to non gl enabled canvas.
                    return this.initialize(width, height, canvas);
                }

                return this;
            },
            /**
             * Creates an initializes a Scene object.
             * @return {CAAT.Scene}
             */
            createScene:function () {
                var scene = new CAAT.Scene();
                this.addScene(scene);
                return scene;
            },
            setImagesCache:function (imagesCache, tpW, tpH) {

                if (!imagesCache || !imagesCache.length ) {
                    return this;
                }

                var i;

                if (null !== this.glTextureManager) {
                    this.glTextureManager.deletePages();
                    this.glTextureManager = null;
                }

                // delete previous image identifiers
                if (this.imagesCache) {
                    var ids = [];
                    for (i = 0; i < this.imagesCache.length; i++) {
                        ids.push(this.imagesCache[i].id);
                    }

                    for (i = 0; i < ids.length; i++) {
                        delete this.imagesCache[ ids[i] ];
                    }
                }

                this.imagesCache = imagesCache;

                if (imagesCache) {
                    for (i = 0; i < imagesCache.length; i++) {
                        this.imagesCache[ imagesCache[i].id ] = imagesCache[i].image;
                    }
                }

                this.tpW = tpW || 2048;
                this.tpH = tpH || 2048;

                this.updateGLPages();

                return this;
            },
            updateGLPages:function () {
                if (this.glEnabled) {

                    this.glTextureManager = new CAAT.Module.TexturePacker.TexturePageManager();
                    this.glTextureManager.createPages(this.gl, this.tpW, this.tpH, this.imagesCache);

                    this.currentTexturePage = this.glTextureManager.pages[0];
                    this.glTextureProgram.setTexture(this.currentTexturePage.texture);
                }
            },
            setGLTexturePage:function (tp) {
                this.currentTexturePage = tp;
                this.glTextureProgram.setTexture(tp.texture);
                return this;
            },
            /**
             * Add a new image to director's image cache. If gl is enabled and the 'noUpdateGL' is not set to true this
             * function will try to recreate the whole GL texture pages.
             * If many handcrafted images are to be added to the director, some performance can be achieved by calling
             * <code>director.addImage(id,image,false)</code> many times and a final call with
             * <code>director.addImage(id,image,true)</code> to finally command the director to create texture pages.
             *
             * @param id {string|object} an identitifier to retrieve the image with
             * @param image {Image|HTMLCanvasElement} image to add to cache
             * @param noUpdateGL {!boolean} unless otherwise stated, the director will
             *  try to recreate the texture pages.
             */
            addImage:function (id, image, noUpdateGL) {
                if (this.getImage(id)) {
//                    for (var i = 0; i < this.imagesCache.length; i++) {
                    for( var i in this.imagesCache ) {
                        if (this.imagesCache[i].id === id) {
                            this.imagesCache[i].image = image;
                            break;
                        }
                    }
                    this.imagesCache[ id ] = image;
                } else {
                    this.imagesCache.push({ id:id, image:image });
                    this.imagesCache[id] = image;
                }

                if (!!!noUpdateGL) {
                    this.updateGLPages();
                }
            },
            deleteImage:function (id, noUpdateGL) {
                for (var i = 0; i < this.imagesCache.length; i++) {
                    if (this.imagesCache[i].id === id) {
                        delete this.imagesCache[id];
                        this.imagesCache.splice(i, 1);
                        break;
                    }
                }
                if (!!!noUpdateGL) {
                    this.updateGLPages();
                }
            },
            setGLCurrentOpacity:function (opacity) {
                this.currentOpacity = opacity;
                this.glTextureProgram.setAlpha(opacity);
            },
            /**
             * Render buffered elements.
             * @param vertex
             * @param coordsIndex
             * @param uv
             */
            glRender:function (vertex, coordsIndex, uv) {

                vertex = vertex || this.coords;
                uv = uv || this.uv;
                coordsIndex = coordsIndex || this.coordsIndex;

                var gl = this.gl;

                var numTris = coordsIndex / 12 * 2;
                var numVertices = coordsIndex / 3;

                this.glTextureProgram.updateVertexBuffer(vertex);
                this.glTextureProgram.updateUVBuffer(uv);

                gl.drawElements(gl.TRIANGLES, 3 * numTris, gl.UNSIGNED_SHORT, 0);

            },
            glFlush:function () {
                if (this.coordsIndex !== 0) {
                    this.glRender(this.coords, this.coordsIndex, this.uv);
                }
                this.coordsIndex = 0;
                this.uvIndex = 0;

                this.statistics.draws++;
            },

            findActorAtPosition:function (point) {

                // z-order
                var cl = this.childrenList;
                for (var i = cl.length - 1; i >= 0; i--) {
                    var child = this.childrenList[i];

                    var np = new CAAT.Math.Point(point.x, point.y, 0);
                    var contained = child.findActorAtPosition(np);
                    if (null !== contained) {
                        return contained;
                    }
                }

                return this;
            },

            /**
             *
             * Reset statistics information.
             *
             * @private
             */
            resetStats:function () {
                this.statistics.size_total = 0;
                this.statistics.size_active = 0;
                this.statistics.draws = 0;
                this.statistics.size_discarded_by_dirty_rects = 0;
            },

            /**
             * This is the entry point for the animation system of the Director.
             * The director is fed with the elapsed time value to maintain a virtual timeline.
             * This virtual timeline will provide each Scene with its own virtual timeline, and will only
             * feed time when the Scene is the current Scene, or is being switched.
             *
             * If dirty rectangles are enabled and canvas is used for rendering, the dirty rectangles will be
             * set up as a single clip area.
             *
             * @param time {number} integer indicating the elapsed time between two consecutive frames of the
             * Director.
             */
            render:function (time) {

                if (this.currentScene && this.currentScene.isPaused()) {
                    return;
                }

                this.time += time;

                for (i = 0, l = this.childrenList.length; i < l; i++) {
                    var c = this.childrenList[i];
                    if (c.isInAnimationFrame(this.time) && !c.isPaused()) {
                        var tt = c.time - c.start_time;
                        c.timerManager.checkTimers(tt);
                        c.timerManager.removeExpiredTimers();
                    }
                }


                this.animate(this, this.time);

                if (!navigator.isCocoonJS && CAAT.DEBUG) {
                    this.resetStats();
                }

                /**
                 * draw director active scenes.
                 */
                var ne = this.childrenList.length;
                var i, tt, c;
                var ctx = this.ctx;

                if (this.glEnabled) {

                    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
                    this.coordsIndex = 0;
                    this.uvIndex = 0;

                    for (i = 0; i < ne; i++) {
                        c = this.childrenList[i];
                        if (c.isInAnimationFrame(this.time)) {
                            tt = c.time - c.start_time;
                            if (c.onRenderStart) {
                                c.onRenderStart(tt);
                            }
                            c.paintActorGL(this, tt);
                            if (c.onRenderEnd) {
                                c.onRenderEnd(tt);
                            }

                            if (!c.isPaused()) {
                                c.time += time;
                            }

                            if (!navigator.isCocoonJS && CAAT.DEBUG) {
                                this.statistics.size_total += c.size_total;
                                this.statistics.size_active += c.size_active;
                            }

                        }
                    }

                    this.glFlush();

                } else {
                    ctx.globalAlpha = 1;
                    ctx.globalCompositeOperation = 'source-over';

                    ctx.save();
                    if (this.dirtyRectsEnabled) {
                        this.modelViewMatrix.transformRenderingContext(ctx);

                        if (!CAAT.DEBUG_DIRTYRECTS) {
                            ctx.beginPath();
                            this.nDirtyRects = 0;
                            var dr = this.cDirtyRects;
                            for (i = 0; i < dr.length; i++) {
                                var drr = dr[i];
                                if (!drr.isEmpty()) {
                                    ctx.rect(drr.x | 0, drr.y | 0, 1 + (drr.width | 0), 1 + (drr.height | 0));
                                    this.nDirtyRects++;
                                }
                            }
                            ctx.clip();
                        } else {
                            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                        }

                    } else if (this.clear === CAAT.Foundation.Director.CLEAR_ALL) {
                        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    }

                    for (i = 0; i < ne; i++) {
                        c = this.childrenList[i];

                        if (c.isInAnimationFrame(this.time)) {
                            tt = c.time - c.start_time;
                            ctx.save();

                            if (c.onRenderStart) {
                                c.onRenderStart(tt);
                            }

                            if (!CAAT.DEBUG_DIRTYRECTS && this.dirtyRectsEnabled) {
                                if (this.nDirtyRects) {
                                    c.paintActor(this, tt);
                                }
                            } else {
                                c.paintActor(this, tt);
                            }

                            if (c.onRenderEnd) {
                                c.onRenderEnd(tt);
                            }
                            ctx.restore();

                            if (CAAT.DEBUGAABB) {
                                ctx.globalAlpha = 1;
                                ctx.globalCompositeOperation = 'source-over';
                                this.modelViewMatrix.transformRenderingContextSet(ctx);
                                c.drawScreenBoundingBox(this, tt);
                            }

                            if (!c.isPaused()) {
                                c.time += time;
                            }

                            if (!navigator.isCocoonJS && CAAT.DEBUG) {
                                this.statistics.size_total += c.size_total;
                                this.statistics.size_active += c.size_active;
                                this.statistics.size_dirtyRects = this.nDirtyRects;
                            }

                        }
                    }

                    if (this.nDirtyRects > 0 && (!navigator.isCocoonJS && CAAT.DEBUG) && CAAT.DEBUG_DIRTYRECTS) {
                        ctx.beginPath();
                        this.nDirtyRects = 0;
                        var dr = this.cDirtyRects;
                        for (i = 0; i < dr.length; i++) {
                            var drr = dr[i];
                            if (!drr.isEmpty()) {
                                ctx.rect(drr.x | 0, drr.y | 0, 1 + (drr.width | 0), 1 + (drr.height | 0));
                                this.nDirtyRects++;
                            }
                        }

                        ctx.clip();
                        ctx.fillStyle = 'rgba(160,255,150,.4)';
                        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    }

                    ctx.restore();
                }

                this.frameCounter++;
            },

            inDirtyRect:function (actor) {

                if (!this.dirtyRectsEnabled || CAAT.DEBUG_DIRTYRECTS) {
                    return true;
                }

                var dr = this.cDirtyRects;
                var i;
                var aabb = actor.AABB;

                for (i = 0; i < dr.length; i++) {
                    if (dr[i].intersects(aabb)) {
                        return true;
                    }
                }

                this.statistics.size_discarded_by_dirty_rects += actor.size_total;
                return false;
            },

            /**
             * A director is a very special kind of actor.
             * Its animation routine simple sets its modelViewMatrix in case some transformation's been
             * applied.
             * No behaviors are allowed for Director instances.
             * @param director {CAAT.Director} redundant reference to CAAT.Director itself
             * @param time {number} director time.
             */
            animate:function (director, time) {

                this.timerManager.checkTimers(time);

                this.setModelViewMatrix(this);
                this.modelViewMatrixI = this.modelViewMatrix.getInverse();
                this.setScreenBounds();

                this.dirty = false;
                this.invalid = false;
                this.dirtyRectsIndex = -1;
                this.cDirtyRects= [];

                var cl = this.childrenList;
                var cli;
                var i, l;


                if (this.dirtyRectsEnabled) {
                    var sdr = this.sDirtyRects;
                    if (sdr.length) {
                        for (i = 0, l = sdr.length; i < l; i++) {
                            this.addDirtyRect(sdr[i]);
                        }
                        this.sDirtyRects = [];
                    }
                }

                for (i = 0; i < cl.length; i++) {
                    cli = cl[i];
                    var tt = cli.time - cli.start_time;
                    cli.animate(this, tt);
                }

                this.timerManager.removeExpiredTimers();

                return this;
            },

            /**
             * This method is used when asynchronous operations must produce some dirty rectangle painting.
             * This means that every operation out of the regular CAAT loop must add dirty rect operations
             * by calling this method.
             * For example setVisible() and remove.
             * @param rectangle
             */
            scheduleDirtyRect:function (rectangle) {
                this.sDirtyRects.push(rectangle);
            },
            /**
             * Add a rectangle to the list of dirty screen areas which should be redrawn.
             * This is the opposite method to clear the whole screen and repaint everything again.
             * Despite i'm not very fond of dirty rectangles because it needs some extra calculations, this
             * procedure has shown to be speeding things up under certain situations. Nevertheless it doesn't or
             * even lowers performance under others, so it is a developer choice to activate them via a call to
             * setClear( CAAT.Director.CLEAR_DIRTY_RECTS ).
             *
             * This function, not only tracks a list of dirty rectangles, but tries to optimize the list. Overlapping
             * rectangles will be removed and intersecting ones will be unioned.
             *
             * Before calling this method, check if this.dirtyRectsEnabled is true.
             *
             * @param rectangle {CAAT.Rectangle}
             */
            addDirtyRect:function (rectangle) {

                if (rectangle.isEmpty()) {
                    return;
                }

                var i, dr, j, drj;
                var cdr = this.cDirtyRects;

                for (i = 0; i < cdr.length; i++) {
                    dr = cdr[i];
                    if (!dr.isEmpty() && dr.intersects(rectangle)) {
                        var intersected = true;
                        while (intersected) {
                            dr.unionRectangle(rectangle);

                            for (j = 0; j < cdr.length; j++) {
                                if (j !== i) {
                                    drj = cdr[j];
                                    if (!drj.isEmpty() && drj.intersects(dr)) {
                                        dr.unionRectangle(drj);
                                        drj.setEmpty();
                                        break;
                                    }
                                }
                            }

                            if (j == cdr.length) {
                                intersected = false;
                            }
                        }

                        for (j = 0; j < cdr.length; j++) {
                            if (cdr[j].isEmpty()) {
                                cdr.splice(j, 1);
                            }
                        }

                        return;
                    }
                }

                this.dirtyRectsIndex++;

                if (this.dirtyRectsIndex >= this.dirtyRects.length) {
                    for (i = 0; i < 32; i++) {
                        this.dirtyRects.push(new CAAT.Math.Rectangle());
                    }
                }

                var r = this.dirtyRects[ this.dirtyRectsIndex ];

                r.x = rectangle.x;
                r.y = rectangle.y;
                r.x1 = rectangle.x1;
                r.y1 = rectangle.y1;
                r.width = rectangle.width;
                r.height = rectangle.height;

                this.cDirtyRects.push(r);

            },
            /**
             * This method draws an Scene to an offscreen canvas. This offscreen canvas is also a child of
             * another Scene (transitionScene). So instead of drawing two scenes while transitioning from
             * one to another, first of all an scene is drawn to offscreen, and that image is translated.
             * <p>
             * Until the creation of this method, both scenes where drawn while transitioning with
             * its performance penalty since drawing two scenes could be twice as expensive than drawing
             * only one.
             * <p>
             * Though a high performance increase, we should keep an eye on memory consumption.
             *
             * @param ctx a <code>canvas.getContext('2d')</code> instnce.
             * @param scene {CAAT.Foundation.Scene} the scene to draw offscreen.
             */
            renderToContext:function (ctx, scene) {
                /**
                 * draw actors on scene.
                 */
                if (scene.isInAnimationFrame(this.time)) {
                    ctx.setTransform(1, 0, 0, 1, 0, 0);

                    ctx.globalAlpha = 1;
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.clearRect(0, 0, this.width, this.height);

                    var octx = this.ctx;

                    this.ctx = ctx;
                    ctx.save();

                    /**
                     * to draw an scene to an offscreen canvas, we have to:
                     *   1.- save diector's world model view matrix
                     *   2.- set no transformation on director since we want the offscreen to
                     *       be drawn 1:1.
                     *   3.- set world dirty flag, so that the scene will recalculate its matrices
                     *   4.- animate the scene
                     *   5.- paint the scene
                     *   6.- restore world model view matrix.
                     */
                    var matmv = this.modelViewMatrix;
                    var matwmv = this.worldModelViewMatrix;
                    this.worldModelViewMatrix = new CAAT.Math.Matrix();
                    this.modelViewMatrix = this.worldModelViewMatrix;
                    this.wdirty = true;
                    scene.animate(this, scene.time);
                    if (scene.onRenderStart) {
                        scene.onRenderStart(scene.time);
                    }
                    scene.paintActor(this, scene.time);
                    if (scene.onRenderEnd) {
                        scene.onRenderEnd(scene.time);
                    }
                    this.worldModelViewMatrix = matwmv;
                    this.modelViewMatrix = matmv;

                    ctx.restore();

                    this.ctx = octx;
                }
            },
            /**
             * Add a new Scene to Director's Scene list. By adding a Scene to the Director
             * does not mean it will be immediately visible, you should explicitly call either
             * <ul>
             *  <li>easeIn
             *  <li>easeInOut
             *  <li>easeInOutRandom
             *  <li>setScene
             *  <li>or any of the scene switching methods
             * </ul>
             *
             * @param scene {CAAT.Foundation.Scene}
             */
            addScene:function (scene) {
                scene.setBounds(0, 0, this.width, this.height);
                this.scenes.push(scene);
                scene.setEaseListener(this);
                if (null === this.currentScene) {
                    this.setScene(0);
                }
            },
            /**
             * Get the number of scenes contained in the Director.
             * @return {number} the number of scenes contained in the Director.
             */
            getNumScenes:function () {
                return this.scenes.length;
            },
            /**
             * This method offers full control over the process of switching between any given two Scenes.
             * To apply this method, you must specify the type of transition to apply for each Scene and
             * the anchor to keep the Scene pinned at.
             * <p>
             * The type of transition will be one of the following values defined in CAAT.Foundation.Scene.prototype:
             * <ul>
             *  <li>EASE_ROTATION
             *  <li>EASE_SCALE
             *  <li>EASE_TRANSLATION
             * </ul>
             *
             * <p>
             * The anchor will be any of these values defined in CAAT.Foundation.Actor:
             * <ul>
             *  <li>ANCHOR_CENTER
             *  <li>ANCHOR_TOP
             *  <li>ANCHOR_BOTTOM
             *  <li>ANCHOR_LEFT
             *  <li>ANCHOR_RIGHT
             *  <li>ANCHOR_TOP_LEFT
             *  <li>ANCHOR_TOP_RIGHT
             *  <li>ANCHOR_BOTTOM_LEFT
             *  <li>ANCHOR_BOTTOM_RIGHT
             * </ul>
             *
             * <p>
             * In example, for an entering scene performing a EASE_SCALE transition, the anchor is the
             * point by which the scene will scaled.
             *
             * @param inSceneIndex integer indicating the Scene index to bring in to the Director.
             * @param typein integer indicating the type of transition to apply to the bringing in Scene.
             * @param anchorin integer indicating the anchor of the bringing in Scene.
             * @param outSceneIndex integer indicating the Scene index to take away from the Director.
             * @param typeout integer indicating the type of transition to apply to the taking away in Scene.
             * @param anchorout integer indicating the anchor of the taking away Scene.
             * @param time inteter indicating the time to perform the process of switchihg between Scene object
             * in milliseconds.
             * @param alpha boolean boolean indicating whether alpha transparency fading will be applied to
             * the scenes.
             * @param interpolatorIn CAAT.Behavior.Interpolator object to apply to entering scene.
             * @param interpolatorOut CAAT.Behavior.Interpolator object to apply to exiting scene.
             */
            easeInOut:function (inSceneIndex, typein, anchorin, outSceneIndex, typeout, anchorout, time, alpha, interpolatorIn, interpolatorOut) {

                if (inSceneIndex === this.getCurrentSceneIndex()) {
                    return;
                }

                var ssin = this.scenes[ inSceneIndex ];
                var sout = this.scenes[ outSceneIndex ];

                if (!CAAT.__CSS__ && CAAT.CACHE_SCENE_ON_CHANGE) {
                    this.renderToContext(this.transitionScene.ctx, sout);
                    sout = this.transitionScene;
                }

                ssin.setExpired(false);
                sout.setExpired(false);

                ssin.mouseEnabled = false;
                sout.mouseEnabled = false;

                ssin.resetTransform();
                sout.resetTransform();

                ssin.setLocation(0, 0);
                sout.setLocation(0, 0);

                ssin.alpha = 1;
                sout.alpha = 1;

                if (typein === CAAT.Foundation.Scene.EASE_ROTATION) {
                    ssin.easeRotationIn(time, alpha, anchorin, interpolatorIn);
                } else if (typein === CAAT.Foundation.Scene.EASE_SCALE) {
                    ssin.easeScaleIn(0, time, alpha, anchorin, interpolatorIn);
                } else {
                    ssin.easeTranslationIn(time, alpha, anchorin, interpolatorIn);
                }

                if (typeout === CAAT.Foundation.Scene.EASE_ROTATION) {
                    sout.easeRotationOut(time, alpha, anchorout, interpolatorOut);
                } else if (typeout === CAAT.Foundation.Scene.EASE_SCALE) {
                    sout.easeScaleOut(0, time, alpha, anchorout, interpolatorOut);
                } else {
                    sout.easeTranslationOut(time, alpha, anchorout, interpolatorOut);
                }

                this.childrenList = [];

                sout.goOut(ssin);
                ssin.getIn(sout);

                this.addChild(sout);
                this.addChild(ssin);
            },
            /**
             * This method will switch between two given Scene indexes (ie, take away scene number 2,
             * and bring in scene number 5).
             * <p>
             * It will randomly choose for each Scene the type of transition to apply and the anchor
             * point of each transition type.
             * <p>
             * It will also set for different kind of transitions the following interpolators:
             * <ul>
             * <li>EASE_ROTATION    -> ExponentialInOutInterpolator, exponent 4.
             * <li>EASE_SCALE       -> ElasticOutInterpolator, 1.1 and .4
             * <li>EASE_TRANSLATION -> BounceOutInterpolator
             * </ul>
             *
             * <p>
             * These are the default values, and could not be changed by now.
             * This method in final instance delegates the process to easeInOutMethod.
             *
             * @see easeInOutMethod.
             *
             * @param inIndex integer indicating the entering scene index.
             * @param outIndex integer indicating the exiting scene index.
             * @param time integer indicating the time to take for the process of Scene in/out in milliseconds.
             * @param alpha boolean indicating whether alpha transparency fading should be applied to transitions.
             */
            easeInOutRandom:function (inIndex, outIndex, time, alpha) {

                var pin = Math.random();
                var pout = Math.random();

                var typeIn;
                var interpolatorIn;

                if (pin < 0.33) {
                    typeIn = CAAT.Foundation.Scene.EASE_ROTATION;
                    interpolatorIn = new CAAT.Behavior.Interpolator().createExponentialInOutInterpolator(4);
                } else if (pin < 0.66) {
                    typeIn = CAAT.Foundation.Scene.EASE_SCALE;
                    interpolatorIn = new CAAT.Behavior.Interpolator().createElasticOutInterpolator(1.1, 0.4);
                } else {
                    typeIn = CAAT.Foundation.Scene.EASE_TRANSLATE;
                    interpolatorIn = new CAAT.Behavior.Interpolator().createBounceOutInterpolator();
                }

                var typeOut;
                var interpolatorOut;

                if (pout < 0.33) {
                    typeOut = CAAT.Foundation.Scene.EASE_ROTATION;
                    interpolatorOut = new CAAT.Behavior.Interpolator().createExponentialInOutInterpolator(4);
                } else if (pout < 0.66) {
                    typeOut = CAAT.Foundation.Scene.EASE_SCALE;
                    interpolatorOut = new CAAT.Behavior.Interpolator().createExponentialOutInterpolator(4);
                } else {
                    typeOut = CAAT.Foundation.Scene.EASE_TRANSLATE;
                    interpolatorOut = new CAAT.Behavior.Interpolator().createBounceOutInterpolator();
                }

                this.easeInOut(
                    inIndex,
                    typeIn,
                    (Math.random() * 8.99) >> 0,

                    outIndex,
                    typeOut,
                    (Math.random() * 8.99) >> 0,

                    time,
                    alpha,

                    interpolatorIn,
                    interpolatorOut);

            },
            /**
             * This method changes Director's current Scene to the scene index indicated by
             * inSceneIndex parameter. The Scene running in the director won't be eased out.
             *
             * @see {CAAT.Interpolator}
             * @see {CAAT.Actor}
             * @see {CAAT.Scene}
             *
             * @param inSceneIndex integer indicating the new Scene to set as current.
             * @param type integer indicating the type of transition to apply to bring the new current
             * Scene to the Director. The values will be one of: CAAT.Scene.prototype.EASE_ROTATION,
             * CAAT.Scene.prototype.EASE_SCALE, CAAT.Scene.prototype.EASE_TRANSLATION.
             * @param time integer indicating how much time in milliseconds the Scene entrance will take.
             * @param alpha boolean indicating whether alpha transparency fading will be applied to the
             * entereing Scene.
             * @param anchor integer indicating the anchor to fix for Scene transition. It will be any of
             * CAAT.Actor.prototype.ANCHOR_* values.
             * @param interpolator an CAAT.Interpolator object indicating the interpolation function to
             * apply.
             */
            easeIn:function (inSceneIndex, type, time, alpha, anchor, interpolator) {
                var sin = this.scenes[ inSceneIndex ];
                if (type === CAAT.Foundation.Scene.EASE_ROTATION) {
                    sin.easeRotationIn(time, alpha, anchor, interpolator);
                } else if (type === CAAT.Foundation.Scene.EASE_SCALE) {
                    sin.easeScaleIn(0, time, alpha, anchor, interpolator);
                } else {
                    sin.easeTranslationIn(time, alpha, anchor, interpolator);
                }
                this.childrenList = [];
                this.addChild(sin);

                sin.resetTransform();
                sin.setLocation(0, 0);
                sin.alpha = 1;
                sin.mouseEnabled = false;
                sin.setExpired(false);
            },
            /**
             * Changes (or sets) the current Director scene to the index
             * parameter. There will be no transition on scene change.
             * @param sceneIndex {number} an integer indicating the index of the target Scene
             * to be shown.
             */
            setScene:function (sceneIndex) {
                var sin = this.scenes[ sceneIndex ];
                this.childrenList = [];
                this.addChild(sin);
                this.currentScene = sin;

                sin.setExpired(false);
                sin.mouseEnabled = true;
                sin.resetTransform();
                sin.setLocation(0, 0);
                sin.alpha = 1;

                sin.getIn();
                sin.activated();
            },
            /**
             * This method will change the current Scene by the Scene indicated as parameter.
             * It will apply random values for anchor and transition type.
             * @see easeInOutRandom
             *
             * @param iNewSceneIndex {number} an integer indicating the index of the new scene to run on the Director.
             * @param time {number} an integer indicating the time the Scene transition will take.
             * @param alpha {boolean} a boolean indicating whether Scene transition should be fading.
             * @param transition {boolean} a boolean indicating whether the scene change must smoothly animated.
             */
            switchToScene:function (iNewSceneIndex, time, alpha, transition) {
                var currentSceneIndex = this.getSceneIndex(this.currentScene);

                if (!transition) {
                    this.setScene(iNewSceneIndex);
                }
                else {
                    this.easeInOutRandom(iNewSceneIndex, currentSceneIndex, time, alpha);
                }
            },
            /**
             * Sets the previous Scene in sequence as the current Scene.
             * @see switchToScene.
             *
             * @param time {number} integer indicating the time the Scene transition will take.
             * @param alpha {boolean} a boolean indicating whether Scene transition should be fading.
             * @param transition {boolean} a boolean indicating whether the scene change must smoothly animated.
             */
            switchToPrevScene:function (time, alpha, transition) {

                var currentSceneIndex = this.getSceneIndex(this.currentScene);

                if (this.getNumScenes() <= 1 || currentSceneIndex === 0) {
                    return;
                }

                if (!transition) {
                    this.setScene(currentSceneIndex - 1);
                }
                else {
                    this.easeInOutRandom(currentSceneIndex - 1, currentSceneIndex, time, alpha);
                }
            },
            /**
             * Sets the previous Scene in sequence as the current Scene.
             * @see switchToScene.
             *
             * @param time {number} integer indicating the time the Scene transition will take.
             * @param alpha {boolean} a boolean indicating whether Scene transition should be fading.
             * @param transition {boolean} a boolean indicating whether the scene change must smoothly animated.
             */
            switchToNextScene:function (time, alpha, transition) {

                var currentSceneIndex = this.getSceneIndex(this.currentScene);

                if (this.getNumScenes() <= 1 || currentSceneIndex === this.getNumScenes() - 1) {
                    return;
                }

                if (!transition) {
                    this.setScene(currentSceneIndex + 1);
                }
                else {
                    this.easeInOutRandom(currentSceneIndex + 1, currentSceneIndex, time, alpha);
                }
            },
            mouseEnter:function (mouseEvent) {
            },
            mouseExit:function (mouseEvent) {
            },
            mouseMove:function (mouseEvent) {
            },
            mouseDown:function (mouseEvent) {
            },
            mouseUp:function (mouseEvent) {
            },
            mouseDrag:function (mouseEvent) {
            },
            /**
             * Scene easing listener. Notifies scenes when they're about to be activated (set as current
             * director's scene).
             *
             * @param scene {CAAT.Foundation.Scene} the scene that has just been brought in or taken out of the director.
             * @param b_easeIn {boolean} scene enters or exits ?
             */
            easeEnd:function (scene, b_easeIn) {
                // scene is going out
                if (!b_easeIn) {

                    scene.setExpired(true);
                } else {
                    this.currentScene = scene;
                    this.currentScene.activated();
                }

                scene.mouseEnabled = true;
                scene.emptyBehaviorList();
            },
            /**
             * Return the index for a given Scene object contained in the Director.
             * @param scene {CAAT.Foundation.Scene}
             */
            getSceneIndex:function (scene) {
                for (var i = 0; i < this.scenes.length; i++) {
                    if (this.scenes[i] === scene) {
                        return i;
                    }
                }
                return -1;
            },
            /**
             * Get a concrete director's scene.
             * @param index {number} an integer indicating the scene index.
             * @return {CAAT.Foundation.Scene} a CAAT.Scene object instance or null if the index is oob.
             */
            getScene:function (index) {
                return this.scenes[index];
            },
            getSceneById : function(id) {
                for( var i=0; i<this.scenes.length; i++ ) {
                    if (this.scenes[i].id===id) {
                        return this.scenes[i];
                    }
                }
                return null;
            },
            /**
             * Return the index of the current scene in the Director's scene list.
             * @return {number} the current scene's index.
             */
            getCurrentSceneIndex:function () {
                return this.getSceneIndex(this.currentScene);
            },
            /**
             * Return the running browser name.
             * @return {string} the browser name.
             */
            getBrowserName:function () {
                return this.browserInfo.browser;
            },
            /**
             * Return the running browser version.
             * @return {string} the browser version.
             */
            getBrowserVersion:function () {
                return this.browserInfo.version;
            },
            /**
             * Return the operating system name.
             * @return {string} the os name.
             */
            getOSName:function () {
                return this.browserInfo.OS;
            },
            /**
             * Gets the resource with the specified resource name.
             * The Director holds a collection called <code>imagesCache</code>
             * where you can store a JSON of the form
             *  <code>[ { id: imageId, image: imageObject } ]</code>.
             * This structure will be used as a resources cache.
             * There's a CAAT.Module.ImagePreloader class to preload resources and
             * generate this structure on loading finalization.
             *
             * @param sId {object} an String identifying a resource.
             */
            getImage:function (sId) {
                var ret = this.imagesCache[sId];
                if (ret) {
                    return ret;
                }

                //for (var i = 0; i < this.imagesCache.length; i++) {
                for( var i in this.imagesCache ) {
                    if (this.imagesCache[i].id === sId) {
                        return this.imagesCache[i].image;
                    }
                }

                return null;
            },
            musicPlay: function(id) {
                return this.audioManager.playMusic(id);
            },
            musicStop : function() {
                this.audioManager.stopMusic();
            },
            /**
             * Adds an audio to the cache.
             *
             * @see CAAT.Module.Audio.AudioManager.addAudio
             * @return this
             */
            addAudio:function (id, url) {
                this.audioManager.addAudio(id, url);
                return this;
            },
            /**
             * Plays the audio instance identified by the id.
             * @param id {object} the object used to store a sound in the audioCache.
             */
            audioPlay:function (id) {
                return this.audioManager.play(id);
            },
            /**
             * Loops an audio instance identified by the id.
             * @param id {object} the object used to store a sound in the audioCache.
             *
             * @return {HTMLElement|null} the value from audioManager.loop
             */
            audioLoop:function (id) {
                return this.audioManager.loop(id);
            },
            endSound:function () {
                return this.audioManager.endSound();
            },
            setSoundEffectsEnabled:function (enabled) {
                return this.audioManager.setSoundEffectsEnabled(enabled);
            },
            setMusicEnabled:function (enabled) {
                return this.audioManager.setMusicEnabled(enabled);
            },
            isMusicEnabled:function () {
                return this.audioManager.isMusicEnabled();
            },
            isSoundEffectsEnabled:function () {
                return this.audioManager.isSoundEffectsEnabled();
            },
            setVolume:function (id, volume) {
                return this.audioManager.setVolume(id, volume);
            },
            /**
             * Removes Director's scenes.
             */
            emptyScenes:function () {
                this.scenes = [];
            },
            /**
             * Adds an scene to this Director.
             * @param scene {CAAT.Foundation.Scene} a scene object.
             */
            addChild:function (scene) {
                scene.parent = this;
                this.childrenList.push(scene);
            },
            /**
             * @Deprecated use CAAT.loop instead.
             * @param fps
             * @param callback
             * @param callback2
             */
            loop:function (fps, callback, callback2) {
                if (callback2) {
                    this.onRenderStart = callback;
                    this.onRenderEnd = callback2;
                } else if (callback) {
                    this.onRenderEnd = callback;
                }
                CAAT.loop();
            },
            /**
             * Starts the director animation.If no scene is explicitly selected, the current Scene will
             * be the first scene added to the Director.
             * <p>
             * The fps parameter will set the animation quality. Higher values,
             * means CAAT will try to render more frames in the same second (at the
             * expense of cpu power at least until hardware accelerated canvas rendering
             * context are available). A value of 60 is a high frame rate and should not be exceeded.
             *
             */
            renderFrame:function () {

                CAAT.currentDirector = this;

                if (this.stopped) {
                    return;
                }

                var t = new Date().getTime(),
                    delta = t - this.timeline;

                /*
                 check for massive frame time. if for example the current browser tab is minified or taken out of
                 foreground, the system will account for a bit time interval. minify that impact by lowering down
                 the elapsed time (virtual timelines FTW)
                 */
                if (delta > 500) {
                    delta = 500;
                }

                if (this.onRenderStart) {
                    this.onRenderStart(delta);
                }

                this.render(delta);

                if (this.debugInfo) {
                    this.debugInfo(this.statistics);
                }

                this.timeline = t;

                if (this.onRenderEnd) {
                    this.onRenderEnd(delta);
                }

                this.needsRepaint = false;
            },

            /**
             * If the director has renderingMode: DIRTY, the timeline must be reset to register accurate frame measurement.
             */
            resetTimeline:function () {
                this.timeline = new Date().getTime();
            },

            endLoop:function () {
            },
            /**
             * This method states whether the director must clear background before rendering
             * each frame.
             *
             * The clearing method could be:
             *  + CAAT.Director.CLEAR_ALL. previous to draw anything on screen the canvas will have clearRect called on it.
             *  + CAAT.Director.CLEAR_DIRTY_RECTS. Actors marked as invalid, or which have been moved, rotated or scaled
             *    will have their areas redrawn.
             *  + CAAT.Director.CLEAR_NONE. clears nothing.
             *
             * @param clear {CAAT.Director.CLEAR_ALL | CAAT.Director.CLEAR_NONE | CAAT.Director.CLEAR_DIRTY_RECTS}
             * @return this.
             */
            setClear:function (clear) {
                this.clear = clear;
                if (this.clear === CAAT.Foundation.Director.CLEAR_DIRTY_RECTS) {
                    this.dirtyRectsEnabled = true;
                } else {
                    this.dirtyRectsEnabled= false;
                }
                return this;
            },
            /**
             * Get this Director's AudioManager instance.
             * @return {CAAT.AudioManager} the AudioManager instance.
             */
            getAudioManager:function () {
                return this.audioManager;
            },
            /**
             * Acculumate dom elements position to properly offset on-screen mouse/touch events.
             * @param node
             */
            cumulateOffset:function (node, parent, prop) {
                var left = prop + 'Left';
                var top = prop + 'Top';
                var x = 0, y = 0, style;

                while (navigator.browser !== 'iOS' && node && node.style) {
                    if (node.currentStyle) {
                        style = node.currentStyle['position'];
                    } else {
                        style = (node.ownerDocument.defaultView || node.ownerDocument.parentWindow).getComputedStyle(node, null);
                        style = style ? style.getPropertyValue('position') : null;
                    }

//                if (!/^(relative|absolute|fixed)$/.test(style)) {
                    if (!/^(fixed)$/.test(style)) {
                        x += node[left];
                        y += node[top];
                        node = node[parent];
                    } else {
                        break;
                    }
                }

                return {
                    x:x,
                    y:y,
                    style:style
                };
            },
            getOffset:function (node) {
                var res = this.cumulateOffset(node, 'offsetParent', 'offset');
                if (res.style === 'fixed') {
                    var res2 = this.cumulateOffset(node, node.parentNode ? 'parentNode' : 'parentElement', 'scroll');
                    return {
                        x:res.x + res2.x,
                        y:res.y + res2.y
                    };
                }

                return {
                    x:res.x,
                    y:res.y
                };
            },
            /**
             * Normalize input event coordinates to be related to (0,0) canvas position.
             * @param point {CAAT.Math.Point} canvas coordinate.
             * @param e {MouseEvent} a mouse event from an input event.
             */
            getCanvasCoord:function (point, e) {

                var pt = new CAAT.Math.Point();
                var posx = 0;
                var posy = 0;
                if (!e) e = window.event;

                if (e.pageX || e.pageY) {
                    posx = e.pageX;
                    posy = e.pageY;
                }
                else if (e.clientX || e.clientY) {
                    posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                    posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                }

                var offset = this.getOffset(this.canvas);

                posx -= offset.x;
                posy -= offset.y;

                posx*= this.SCREEN_RATIO;
                posy*= this.SCREEN_RATIO;

                //////////////
                // transformar coordenada inversamente con affine transform de director.

                pt.x = posx;
                pt.y = posy;
                if (!this.modelViewMatrixI) {
                    this.modelViewMatrixI = this.modelViewMatrix.getInverse();
                }
                this.modelViewMatrixI.transformCoord(pt);
                posx = pt.x;
                posy = pt.y

                point.set(posx, posy);
                this.screenMousePoint.set(posx, posy);

            },

            __mouseDownHandler:function (e) {

                /*
                 was dragging and mousedown detected, can only mean a mouseOut's been performed and on mouseOver, no
                 button was presses. Then, send a mouseUp for the previos actor, and return;
                 */
                if (this.dragging && this.lastSelectedActor) {
                    this.__mouseUpHandler(e);
                    return;
                }

                this.getCanvasCoord(this.mousePoint, e);
                this.isMouseDown = true;
                var lactor = this.findActorAtPosition(this.mousePoint);

                if (null !== lactor) {

                    var pos = lactor.viewToModel(
                        new CAAT.Math.Point(this.screenMousePoint.x, this.screenMousePoint.y, 0));

                    lactor.mouseDown(
                        new CAAT.Event.MouseEvent().init(
                            pos.x,
                            pos.y,
                            e,
                            lactor,
                            new CAAT.Math.Point(
                                this.screenMousePoint.x,
                                this.screenMousePoint.y)));
                }

                this.lastSelectedActor = lactor;
            },

            __mouseUpHandler:function (e) {

                this.isMouseDown = false;
                this.getCanvasCoord(this.mousePoint, e);

                var pos = null;
                var lactor = this.lastSelectedActor;

                if (null !== lactor) {
                    pos = lactor.viewToModel(
                        new CAAT.Math.Point(this.screenMousePoint.x, this.screenMousePoint.y, 0));
                    if (lactor.actionPerformed && lactor.contains(pos.x, pos.y)) {
                        lactor.actionPerformed(e)
                    }

                    lactor.mouseUp(
                        new CAAT.Event.MouseEvent().init(
                            pos.x,
                            pos.y,
                            e,
                            lactor,
                            this.screenMousePoint,
                            this.currentScene.time));
                }

                if (!this.dragging && null !== lactor) {
                    if (lactor.contains(pos.x, pos.y)) {
                        lactor.mouseClick(
                            new CAAT.Event.MouseEvent().init(
                                pos.x,
                                pos.y,
                                e,
                                lactor,
                                this.screenMousePoint,
                                this.currentScene.time));
                    }
                }

                this.dragging = false;
                this.in_ = false;
//            CAAT.setCursor('default');
            },

            __mouseMoveHandler:function (e) {
                //this.getCanvasCoord(this.mousePoint, e);

                var lactor;
                var pos;

                var ct = this.currentScene ? this.currentScene.time : 0;

                // drag

                if (this.isMouseDown && null!==this.lastSelectedActor) {

                    lactor = this.lastSelectedActor;
                    pos = lactor.viewToModel(
                        new CAAT.Math.Point(this.screenMousePoint.x, this.screenMousePoint.y, 0));

                    // check for mouse move threshold.
                    if (!this.dragging) {
                        if (Math.abs(this.prevMousePoint.x - pos.x) < CAAT.DRAG_THRESHOLD_X &&
                            Math.abs(this.prevMousePoint.y - pos.y) < CAAT.DRAG_THRESHOLD_Y) {
                            return;
                        }
                    }

                    this.dragging = true;

                    var px = lactor.x;
                    var py = lactor.y;
                    lactor.mouseDrag(
                        new CAAT.Event.MouseEvent().init(
                            pos.x,
                            pos.y,
                            e,
                            lactor,
                            new CAAT.Math.Point(
                                this.screenMousePoint.x,
                                this.screenMousePoint.y),
                            ct));

                    this.prevMousePoint.x = pos.x;
                    this.prevMousePoint.y = pos.y;

                    /**
                     * Element has not moved after drag, so treat it as a button.
                     */
                    if (px === lactor.x && py === lactor.y) {

                        var contains = lactor.contains(pos.x, pos.y);

                        if (this.in_ && !contains) {
                            lactor.mouseExit(
                                new CAAT.Event.MouseEvent().init(
                                    pos.x,
                                    pos.y,
                                    e,
                                    lactor,
                                    this.screenMousePoint,
                                    ct));
                            this.in_ = false;
                        }

                        if (!this.in_ && contains) {
                            lactor.mouseEnter(
                                new CAAT.Event.MouseEvent().init(
                                    pos.x,
                                    pos.y,
                                    e,
                                    lactor,
                                    this.screenMousePoint,
                                    ct));
                            this.in_ = true;
                        }
                    }

                    return;
                }

                // mouse move.
                this.in_ = true;

                lactor = this.findActorAtPosition(this.mousePoint);

                // cambiamos de actor.
                if (lactor !== this.lastSelectedActor) {
                    if (null !== this.lastSelectedActor) {

                        pos = this.lastSelectedActor.viewToModel(
                            new CAAT.Math.Point(this.screenMousePoint.x, this.screenMousePoint.y, 0));

                        this.lastSelectedActor.mouseExit(
                            new CAAT.Event.MouseEvent().init(
                                pos.x,
                                pos.y,
                                e,
                                this.lastSelectedActor,
                                this.screenMousePoint,
                                ct));
                    }

                    if (null !== lactor) {
                        pos = lactor.viewToModel(
                            new CAAT.Math.Point(this.screenMousePoint.x, this.screenMousePoint.y, 0));

                        lactor.mouseEnter(
                            new CAAT.Event.MouseEvent().init(
                                pos.x,
                                pos.y,
                                e,
                                lactor,
                                this.screenMousePoint,
                                ct));
                    }
                }

                pos = lactor.viewToModel(
                    new CAAT.Math.Point(this.screenMousePoint.x, this.screenMousePoint.y, 0));

                if (null !== lactor) {

                    lactor.mouseMove(
                        new CAAT.Event.MouseEvent().init(
                            pos.x,
                            pos.y,
                            e,
                            lactor,
                            this.screenMousePoint,
                            ct));
                }

                this.prevMousePoint.x = pos.x;
                this.prevMousePoint.y = pos.y;

                this.lastSelectedActor = lactor;
            },

            __mouseOutHandler:function (e) {

                if (this.dragging) {
                    return;
                }

                if (null !== this.lastSelectedActor) {

                    this.getCanvasCoord(this.mousePoint, e);
                    var pos = new CAAT.Math.Point(this.mousePoint.x, this.mousePoint.y, 0);
                    this.lastSelectedActor.viewToModel(pos);

                    var ev = new CAAT.Event.MouseEvent().init(
                        pos.x,
                        pos.y,
                        e,
                        this.lastSelectedActor,
                        this.screenMousePoint,
                        this.currentScene.time);

                    this.lastSelectedActor.mouseExit(ev);
                    this.lastSelectedActor.mouseOut(ev);
                    if (!this.dragging) {
                        this.lastSelectedActor = null;
                    }
                } else {
                    this.isMouseDown = false;
                    this.in_ = false;

                }

            },

            __mouseOverHandler:function (e) {

                if (this.dragging) {
                    return;
                }

                var lactor;
                var pos, ev;

                if (null == this.lastSelectedActor) {
                    lactor = this.findActorAtPosition(this.mousePoint);

                    if (null !== lactor) {

                        pos = lactor.viewToModel(
                            new CAAT.Math.Point(this.screenMousePoint.x, this.screenMousePoint.y, 0));

                        ev = new CAAT.Event.MouseEvent().init(
                            pos.x,
                            pos.y,
                            e,
                            lactor,
                            this.screenMousePoint,
                            this.currentScene ? this.currentScene.time : 0);

                        lactor.mouseOver(ev);
                        lactor.mouseEnter(ev);
                    }

                    this.lastSelectedActor = lactor;
                } else {
                    lactor = this.lastSelectedActor;
                    pos = lactor.viewToModel(
                        new CAAT.Math.Point(this.screenMousePoint.x, this.screenMousePoint.y, 0));

                    ev = new CAAT.Event.MouseEvent().init(
                        pos.x,
                        pos.y,
                        e,
                        lactor,
                        this.screenMousePoint,
                        this.currentScene.time);

                    lactor.mouseOver(ev);
                    lactor.mouseEnter(ev);

                }
            },

            __mouseDBLClickHandler:function (e) {

                this.getCanvasCoord(this.mousePoint, e);
                if (null !== this.lastSelectedActor) {
                    /*
                     var pos = this.lastSelectedActor.viewToModel(
                     new CAAT.Point(this.screenMousePoint.x, this.screenMousePoint.y, 0));
                     */
                    this.lastSelectedActor.mouseDblClick(
                        new CAAT.Event.MouseEvent().init(
                            this.mousePoint.x,
                            this.mousePoint.y,
                            e,
                            this.lastSelectedActor,
                            this.screenMousePoint,
                            this.currentScene.time));
                }
            },

            /**
             * Same as mouseDown but not preventing event.
             * Will only take care of first touch.
             * @param e
             */
            __touchStartHandler:function (e) {

                if (e.target === this.canvas) {
                    e.preventDefault();
                    e.returnValue = false;

                    e = e.targetTouches[0];

                    var mp = this.mousePoint;
                    this.getCanvasCoord(mp, e);
                    if (mp.x < 0 || mp.y < 0 || mp.x >= this.width || mp.y >= this.height) {
                        return;
                    }

                    this.touching = true;

                    this.__mouseDownHandler(e);
                }
            },

            __touchEndHandler:function (e) {

                if (this.touching) {
                    e.preventDefault();
                    e.returnValue = false;

                    e = e.changedTouches[0];
                    var mp = this.mousePoint;
                    this.getCanvasCoord(mp, e);

                    this.touching = false;

                    this.__mouseUpHandler(e);
                }
            },

            __touchMoveHandler:function (e) {

                if (this.touching) {
                    e.preventDefault();
                    e.returnValue = false;

                    if (this.gesturing) {
                        return;
                    }

                    for (var i = 0; i < e.targetTouches.length; i++) {
                        var ee = e.targetTouches[i];
                        var mp = this.mousePoint;
                        this.getCanvasCoord(mp, ee);
                        this.__mouseMoveHandler(ee);
                    }
                }
            },

            __gestureStart:function (scale, rotation) {
                this.gesturing = true;
                this.__gestureRotation = this.lastSelectedActor.rotationAngle;
                this.__gestureSX = this.lastSelectedActor.scaleX - 1;
                this.__gestureSY = this.lastSelectedActor.scaleY - 1;
            },

            __gestureChange:function (scale, rotation) {
                if (typeof scale === 'undefined' || typeof rotation === 'undefined') {
                    return;
                }

                if (this.lastSelectedActor !== null && this.lastSelectedActor.isGestureEnabled()) {
                    this.lastSelectedActor.setRotation(rotation * Math.PI / 180 + this.__gestureRotation);

                    this.lastSelectedActor.setScale(
                        this.__gestureSX + scale,
                        this.__gestureSY + scale);
                }

            },

            __gestureEnd:function (scale, rotation) {
                this.gesturing = false;
                this.__gestureRotation = 0;
                this.__gestureScale = 0;
            },

            __touchEndHandlerMT:function (e) {

                e.preventDefault();
                e.returnValue = false;

                var i, j;
                var recent = [];

                /**
                 * extrae actores afectados, y coordenadas relativas para ellos.
                 * crear una coleccion touch-id : { actor, touch-event }
                 */
                for (i = 0; i < e.changedTouches.length; i++) {
                    var _touch = e.changedTouches[i];
                    var id = _touch.identifier;
                    recent.push(id);
                }


                /**
                 * para los touch identificados, extraer que actores se han afectado.
                 * crear eventos con la info de touch para cada uno.
                 */

                var actors = {};
                for (i = 0; i < recent.length; i++) {
                    var touchId = recent[ i ];
                    if (this.touches[ touchId ]) {
                        var actor = this.touches[ touchId ].actor;

                        if (!actors[actor.id]) {
                            actors[actor.id] = {
                                actor:actor,
                                touch:new CAAT.Event.TouchEvent().init(e, actor, this.currentScene.time)
                            };
                        }

                        var ev = actors[ actor.id ].touch;
                        ev.addChangedTouch(this.touches[ touchId ].touch);
                    }
                }

                /**
                 * remove ended touch info.
                 */
                for (i = 0; i < e.changedTouches.length; i++) {
                    var touch = e.changedTouches[i];
                    var id = touch.identifier;
                    delete this.touches[id];
                }

                /**
                 * notificar a todos los actores.
                 */
                for (var pr in actors) {
                    var data = actors[pr];
                    var actor = data.actor;
                    var touch = data.touch;

                    for (var actorId in this.touches) {
                        var tt = this.touches[actorId]
                        if (tt.actor.id === actor.id) {
                            touch.addTouch(tt.touch);
                        }
                    }

                    actor.touchEnd(touch);
                }
            },

            __touchMoveHandlerMT:function (e) {

                e.preventDefault();
                e.returnValue = false;

                var i;
                var recent = [];

                /**
                 * extrae actores afectados, y coordenadas relativas para ellos.
                 * crear una coleccion touch-id : { actor, touch-event }
                 */
                for (i = 0; i < e.changedTouches.length; i++) {
                    var touch = e.changedTouches[i];
                    var id = touch.identifier;

                    if (this.touches[ id ]) {
                        var mp = this.mousePoint;
                        this.getCanvasCoord(mp, touch);

                        var actor = this.touches[ id ].actor;
                        mp = actor.viewToModel(mp);

                        this.touches[ id ] = {
                            actor:actor,
                            touch:new CAAT.Event.TouchInfo(id, mp.x, mp.y, actor)
                        };

                        recent.push(id);
                    }
                }

                /**
                 * para los touch identificados, extraer que actores se han afectado.
                 * crear eventos con la info de touch para cada uno.
                 */

                var actors = {};
                for (i = 0; i < recent.length; i++) {
                    var touchId = recent[ i ];
                    var actor = this.touches[ touchId ].actor;

                    if (!actors[actor.id]) {
                        actors[actor.id] = {
                            actor:actor,
                            touch:new CAAT.Event.TouchEvent().init(e, actor, this.currentScene.time)
                        };
                    }

                    var ev = actors[ actor.id ].touch;
                    ev.addTouch(this.touches[ touchId ].touch);
                    ev.addChangedTouch(this.touches[ touchId ].touch);
                }

                /**
                 * notificar a todos los actores.
                 */
                for (var pr in actors) {
                    var data = actors[pr];
                    var actor = data.actor;
                    var touch = data.touch;

                    for (var actorId in this.touches) {
                        var tt = this.touches[actorId]
                        if (tt.actor.id === actor.id) {
                            touch.addTouch(tt.touch);
                        }
                    }

                    actor.touchMove(touch);
                }
            },

            __touchCancelHandleMT:function (e) {
                this.__touchEndHandlerMT(e);
            },

            __touchStartHandlerMT:function (e) {
                e.preventDefault();
                e.returnValue = false;

                var i;
                var recent = [];
                var allInCanvas = true;

                /**
                 * extrae actores afectados, y coordenadas relativas para ellos.
                 * crear una coleccion touch-id : { actor, touch-event }
                 */
                for (i = 0; i < e.changedTouches.length; i++) {
                    var touch = e.changedTouches[i];
                    var id = touch.identifier;
                    var mp = this.mousePoint;
                    this.getCanvasCoord(mp, touch);
                    if (mp.x < 0 || mp.y < 0 || mp.x >= this.width || mp.y >= this.height) {
                        allInCanvas = false;
                        continue;
                    }

                    var actor = this.findActorAtPosition(mp);
                    if (actor !== null) {
                        mp = actor.viewToModel(mp);

                        if (!this.touches[ id ]) {

                            this.touches[ id ] = {
                                actor:actor,
                                touch:new CAAT.Event.TouchInfo(id, mp.x, mp.y, actor)
                            };

                            recent.push(id);
                        }

                    }
                }

                /**
                 * para los touch identificados, extraer que actores se han afectado.
                 * crear eventos con la info de touch para cada uno.
                 */

                var actors = {};
                for (i = 0; i < recent.length; i++) {
                    var touchId = recent[ i ];
                    var actor = this.touches[ touchId ].actor;

                    if (!actors[actor.id]) {
                        actors[actor.id] = {
                            actor:actor,
                            touch:new CAAT.Event.TouchEvent().init(e, actor, this.currentScene.time)
                        };
                    }

                    var ev = actors[ actor.id ].touch;
                    ev.addTouch(this.touches[ touchId ].touch);
                    ev.addChangedTouch(this.touches[ touchId ].touch);
                }

                /**
                 * notificar a todos los actores.
                 */
                for (var pr in actors) {
                    var data = actors[pr];
                    var actor = data.actor;
                    var touch = data.touch;

                    for (var actorId in this.touches) {
                        var tt = this.touches[actorId]
                        if (tt.actor.id === actor.id) {
                            touch.addTouch(tt.touch);
                        }
                    }

                    actor.touchStart(touch);
                }

            },

            __findTouchFirstActor:function () {

                var t = Number.MAX_VALUE;
                var actor = null;
                for (var pr in this.touches) {

                    var touch = this.touches[pr];

                    if (touch.touch.time && touch.touch.time < t && touch.actor.isGestureEnabled()) {
                        actor = touch.actor;
                        t = touch.touch.time;
                    }
                }
                return actor;
            },

            __gesturedActor:null,
            __touchGestureStartHandleMT:function (e) {
                var actor = this.__findTouchFirstActor();

                if (actor !== null && actor.isGestureEnabled()) {
                    this.__gesturedActor = actor;
                    this.__gestureRotation = actor.rotationAngle;
                    this.__gestureSX = actor.scaleX - 1;
                    this.__gestureSY = actor.scaleY - 1;


                    actor.gestureStart(
                        e.rotation * Math.PI / 180,
                        e.scale + this.__gestureSX,
                        e.scale + this.__gestureSY);
                }
            },

            __touchGestureEndHandleMT:function (e) {

                if (null !== this.__gesturedActor && this.__gesturedActor.isGestureEnabled()) {
                    this.__gesturedActor.gestureEnd(
                        e.rotation * Math.PI / 180,
                        e.scale + this.__gestureSX,
                        e.scale + this.__gestureSY);
                }

                this.__gestureRotation = 0;
                this.__gestureScale = 0;


            },

            __touchGestureChangeHandleMT:function (e) {

                if (this.__gesturedActor !== null && this.__gesturedActor.isGestureEnabled()) {
                    this.__gesturedActor.gestureChange(
                        e.rotation * Math.PI / 180,
                        this.__gestureSX + e.scale,
                        this.__gestureSY + e.scale);
                }
            },


            addHandlers:function (canvas) {

                var me = this;

                window.addEventListener('mouseup', function (e) {
                    if (me.touching) {
                        e.preventDefault();
                        e.cancelBubble = true;
                        if (e.stopPropagation) e.stopPropagation();

                        var mp = me.mousePoint;
                        me.getCanvasCoord(mp, e);
                        me.__mouseUpHandler(e);

                        me.touching = false;
                    }
                }, false);

                window.addEventListener('mousedown', function (e) {
                    if (e.target === canvas) {
                        e.preventDefault();
                        e.cancelBubble = true;
                        if (e.stopPropagation) e.stopPropagation();

                        var mp = me.mousePoint;
                        me.getCanvasCoord(mp, e);
                        if (mp.x < 0 || mp.y < 0 || mp.x >= me.width || mp.y >= me.height) {
                            return;
                        }
                        me.touching = true;

                        me.__mouseDownHandler(e);
                    }
                }, false);

                window.addEventListener('mouseover', function (e) {
                    if (e.target === canvas && !me.dragging) {
                        e.preventDefault();
                        e.cancelBubble = true;
                        if (e.stopPropagation) e.stopPropagation();

                        var mp = me.mousePoint;
                        me.getCanvasCoord(mp, e);
                        if (mp.x < 0 || mp.y < 0 || mp.x >= me.width || mp.y >= me.height) {
                            return;
                        }

                        me.__mouseOverHandler(e);
                    }
                }, false);

                window.addEventListener('mouseout', function (e) {
                    if (e.target === canvas && !me.dragging) {
                        e.preventDefault();
                        e.cancelBubble = true;
                        if (e.stopPropagation) e.stopPropagation();

                        var mp = me.mousePoint;
                        me.getCanvasCoord(mp, e);
                        me.__mouseOutHandler(e);
                    }
                }, false);

                window.addEventListener('mousemove', function (e) {
                    e.preventDefault();
                    e.cancelBubble = true;
                    if (e.stopPropagation) e.stopPropagation();

                    var mp = me.mousePoint;
                    me.getCanvasCoord(mp, e);
                    if (!me.dragging && ( mp.x < 0 || mp.y < 0 || mp.x >= me.width || mp.y >= me.height )) {
                        return;
                    }
                    me.__mouseMoveHandler(e);
                }, false);

                window.addEventListener("dblclick", function (e) {
                    if (e.target === canvas) {
                        e.preventDefault();
                        e.cancelBubble = true;
                        if (e.stopPropagation) e.stopPropagation();
                        var mp = me.mousePoint;
                        me.getCanvasCoord(mp, e);
                        if (mp.x < 0 || mp.y < 0 || mp.x >= me.width || mp.y >= me.height) {
                            return;
                        }

                        me.__mouseDBLClickHandler(e);
                    }
                }, false);

                if (CAAT.TOUCH_BEHAVIOR === CAAT.TOUCH_AS_MOUSE) {
                    canvas.addEventListener("touchstart", this.__touchStartHandler.bind(this), false);
                    canvas.addEventListener("touchmove", this.__touchMoveHandler.bind(this), false);
                    canvas.addEventListener("touchend", this.__touchEndHandler.bind(this), false);
                    canvas.addEventListener("gesturestart", function (e) {
                        if (e.target === canvas) {
                            e.preventDefault();
                            e.returnValue = false;
                            me.__gestureStart(e.scale, e.rotation);
                        }
                    }, false);
                    canvas.addEventListener("gestureend", function (e) {
                        if (e.target === canvas) {
                            e.preventDefault();
                            e.returnValue = false;
                            me.__gestureEnd(e.scale, e.rotation);
                        }
                    }, false);
                    canvas.addEventListener("gesturechange", function (e) {
                        if (e.target === canvas) {
                            e.preventDefault();
                            e.returnValue = false;
                            me.__gestureChange(e.scale, e.rotation);
                        }
                    }, false);
                } else if (CAAT.TOUCH_BEHAVIOR === CAAT.TOUCH_AS_MULTITOUCH) {
                    canvas.addEventListener("touchstart", this.__touchStartHandlerMT.bind(this), false);
                    canvas.addEventListener("touchmove", this.__touchMoveHandlerMT.bind(this), false);
                    canvas.addEventListener("touchend", this.__touchEndHandlerMT.bind(this), false);
                    canvas.addEventListener("touchcancel", this.__touchCancelHandleMT.bind(this), false);

                    canvas.addEventListener("gesturestart", this.__touchGestureStartHandleMT.bind(this), false);
                    canvas.addEventListener("gestureend", this.__touchGestureEndHandleMT.bind(this), false);
                    canvas.addEventListener("gesturechange", this.__touchGestureChangeHandleMT.bind(this), false);
                }

            },

            enableEvents:function (onElement) {
                CAAT.RegisterDirector(this);
                this.in_ = false;
                this.createEventHandler(onElement);
            },

            createEventHandler:function (onElement) {
                //var canvas= this.canvas;
                this.in_ = false;
                //this.addHandlers(canvas);
                this.addHandlers(onElement);
            }
        }
    },

    onCreate:function () {

        if (typeof CAAT.__CSS__!=="undefined") {

            CAAT.Foundation.Director.prototype.clip = true;
            CAAT.Foundation.Director.prototype.glEnabled = false;

            CAAT.Foundation.Director.prototype.getRenderType = function () {
                return 'CSS';
            };

            CAAT.Foundation.Director.prototype.setScaleProportional = function (w, h) {

                var factor = Math.min(w / this.referenceWidth, h / this.referenceHeight);
                this.setScaleAnchored(factor, factor, 0, 0);

                this.eventHandler.style.width = '' + this.referenceWidth + 'px';
                this.eventHandler.style.height = '' + this.referenceHeight + 'px';
            };

            CAAT.Foundation.Director.prototype.setBounds = function (x, y, w, h) {
                CAAT.Foundation.Director.superclass.setBounds.call(this, x, y, w, h);
                for (var i = 0; i < this.scenes.length; i++) {
                    this.scenes[i].setBounds(0, 0, w, h);
                }
                this.eventHandler.style.width = w + 'px';
                this.eventHandler.style.height = h + 'px';

                return this;
            };

            /**
             * In this DOM/CSS implementation, proxy is not taken into account since the event router is a top most
             * div in the document hierarchy (z-index 999999).
             * @param width
             * @param height
             * @param domElement
             * @param proxy
             */
            CAAT.Foundation.Director.prototype.initialize = function (width, height, domElement, proxy) {

                this.timeline = new Date().getTime();
                this.domElement = domElement;
                this.style('position', 'absolute');
                this.style('width', '' + width + 'px');
                this.style('height', '' + height + 'px');
                this.style('overflow', 'hidden');

                this.enableEvents(domElement);

                this.setBounds(0, 0, width, height);

                this.checkDebug();
                return this;
            };

            CAAT.Foundation.Director.prototype.render = function (time) {

                this.time += time;
                this.animate(this, time);

                /**
                 * draw director active scenes.
                 */
                var i, l, tt;

                if (!navigator.isCocoonJS && CAAT.DEBUG) {
                    this.resetStats();
                }

                for (i = 0, l = this.childrenList.length; i < l; i++) {
                    var c = this.childrenList[i];
                    if (c.isInAnimationFrame(this.time) && !c.isPaused()) {
                        tt = c.time - c.start_time;
                        c.timerManager.checkTimers(tt);
                        c.timerManager.removeExpiredTimers();
                    }
                }

                for (i = 0, l = this.childrenList.length; i < l; i++) {
                    var c = this.childrenList[i];
                    if (c.isInAnimationFrame(this.time)) {
                        tt = c.time - c.start_time;
                        if (c.onRenderStart) {
                            c.onRenderStart(tt);
                        }

                        c.paintActor(this, tt);

                        if (c.onRenderEnd) {
                            c.onRenderEnd(tt);
                        }

                        if (!c.isPaused()) {
                            c.time += time;
                        }

                        if (!navigator.isCocoonJS && CAAT.DEBUG) {
                            this.statistics.size_discarded_by_dirtyRects += this.drDiscarded;
                            this.statistics.size_total += c.size_total;
                            this.statistics.size_active += c.size_active;
                            this.statistics.size_dirtyRects = this.nDirtyRects;

                        }

                    }
                }

                this.frameCounter++;
            };

            CAAT.Foundation.Director.prototype.addScene = function (scene) {
                scene.setVisible(true);
                scene.setBounds(0, 0, this.width, this.height);
                this.scenes.push(scene);
                scene.setEaseListener(this);
                if (null === this.currentScene) {
                    this.setScene(0);
                }

                this.domElement.appendChild(scene.domElement);
            };

            CAAT.Foundation.Director.prototype.emptyScenes = function () {
                this.scenes = [];
                this.domElement.innerHTML = '';
                this.createEventHandler();
            };

            CAAT.Foundation.Director.prototype.setClear = function (clear) {
                return this;
            };

            CAAT.Foundation.Director.prototype.createEventHandler = function () {
                this.eventHandler = document.createElement('div');
                this.domElement.appendChild(this.eventHandler);

                this.eventHandler.style.position = 'absolute';
                this.eventHandler.style.left = '0';
                this.eventHandler.style.top = '0';
                this.eventHandler.style.zIndex = 999999;
                this.eventHandler.style.width = '' + this.width + 'px';
                this.eventHandler.style.height = '' + this.height + 'px';

                this.canvas = this.eventHandler;
                this.in_ = false;

                this.addHandlers(this.canvas);
            };

            CAAT.Foundation.Director.prototype.inDirtyRect = function () {
                return true;
            }
        }
    }
});
/**
 * See LICENSE file.
 *
 * In this file we'll be adding every useful Actor that is specific for certain purpose.
 *
 * + CAAT.Dock: a docking container that zooms in/out its actors.
 *
 */

CAAT.Module( {

    /**
     * @name UI
     * @memberOf CAAT.Foundation
     * @namespace
     */

    /**
     * @name Dock
     * @memberOf CAAT.Foundation.UI
     * @extends CAAT.Foundation.ActorContainer
     * @constructor
     */

    defines : "CAAT.Foundation.UI.Dock",
    aliases : ["CAAT.Dock"],
    extendsClass : "CAAT.Foundation.ActorContainer",
    depends : [
        "CAAT.Foundation.ActorContainer",
        "CAAT.Behavior.GenericBehavior"
    ],
    constants : {

        /**
         * @lends CAAT.Foundation.UI.Dock
         */

        /**
         * @const
         */
        OP_LAYOUT_BOTTOM:   0,
        /**
         * @const
         */
        OP_LAYOUT_TOP:      1,
        /**
         * @const
         */
        OP_LAYOUT_LEFT:     2,
        /**
         * @const
         */
        OP_LAYOUT_RIGHT:    3
    },
    extendsWith : {

        /**
         * @lends CAAT.Foundation.UI.Dock.prototype
         */

        /**
         * scene the actor is in.
         */
        scene:              null,

        /**
         * resetting dimension timer task.
         */
        ttask:              null,

        /**
         * min contained actor size.
         */
        minSize:            0,

        /**
         * max contained actor size
         */
        maxSize:            0,

        /**
         * aproximated number of elements affected.
         */
        range:              2,

        /**
         * Any value from CAAT.Foundation.Dock.UI.OP_LAYOUT_*
         */
        layoutOp:           0,

        initialize : function(scene) {
            this.scene= scene;
            return this;
        },
        /**
         * Set the number of elements that will be affected (zoomed) when the mouse is inside the component.
         * @param range {number} a number. Defaults to 2.
         */
        setApplicationRange : function( range ) {
            this.range= range;
            return this;
        },
        /**
         * Set layout orientation. Choose from
         * <ul>
         *  <li>CAAT.Dock.OP_LAYOUT_BOTTOM
         *  <li>CAAT.Dock.OP_LAYOUT_TOP
         *  <li>CAAT.Dock.OP_LAYOUT_BOTTOM
         *  <li>CAAT.Dock.OP_LAYOUT_RIGHT
         * </ul>
         * By default, the layou operation is OP_LAYOUT_BOTTOM, that is, elements zoom bottom anchored.
         *
         * @param lo {number} one of CAAT.Dock.OP_LAYOUT_BOTTOM, CAAT.Dock.OP_LAYOUT_TOP,
         * CAAT.Dock.OP_LAYOUT_BOTTOM, CAAT.Dock.OP_LAYOUT_RIGHT.
         *
         * @return this
         */
        setLayoutOp : function( lo ) {
            this.layoutOp= lo;
            return this;
        },
        /**
         *
         * Set maximum and minimum size of docked elements. By default, every contained actor will be
         * of 'min' size, and will be scaled up to 'max' size.
         *
         * @param min {number}
         * @param max {number}
         * @return this
         */
        setSizes : function( min, max ) {
            this.minSize= min;
            this.maxSize= max;

            for( var i=0; i<this.childrenList.length; i++ ) {
                this.childrenList[i].width= min;
                this.childrenList[i].height= min;
            }

            return this;
        },
        /**
         * Lay out the docking elements. The lay out will be a row with the orientation set by calling
         * the method <code>setLayoutOp</code>.
         *
         * @private
         */
        layout : function() {
            var i,actor;

            var c= CAAT.Foundation.UI.Dock;

            if ( this.layoutOp===c.OP_LAYOUT_BOTTOM || this.layoutOp===c.OP_LAYOUT_TOP ) {

                var currentWidth=0, currentX=0;

                for( i=0; i<this.getNumChildren(); i++ ) {
                    currentWidth+= this.getChildAt(i).width;
                }

                currentX= (this.width-currentWidth)/2;

                for( i=0; i<this.getNumChildren(); i++ ) {
                    actor= this.getChildAt(i);
                    actor.x= currentX;
                    currentX+= actor.width;

                    if ( this.layoutOp===c.OP_LAYOUT_BOTTOM ) {
                        actor.y= this.maxSize- actor.height;
                    } else {
                        actor.y= 0;
                    }
                }
            } else {

                var currentHeight=0, currentY=0;

                for( i=0; i<this.getNumChildren(); i++ ) {
                    currentHeight+= this.getChildAt(i).height;
                }

                currentY= (this.height-currentHeight)/2;

                for( i=0; i<this.getNumChildren(); i++ ) {
                    actor= this.getChildAt(i);
                    actor.y= currentY;
                    currentY+= actor.height;

                    if ( this.layoutOp===c.OP_LAYOUT_LEFT ) {
                        actor.x= 0;
                    } else {
                        actor.x= this.width - actor.width;
                    }
                }

            }

        },
        mouseMove : function(mouseEvent) {
            this.actorNotPointed();
        },
        mouseExit : function(mouseEvent) {
            this.actorNotPointed();
        },
        /**
         * Performs operation when the mouse is not in the dock element.
         *
         * @private
         */
        actorNotPointed : function() {

            var i;
            var me= this;

            for( i=0; i<this.getNumChildren(); i++ ) {
                var actor= this.getChildAt(i);
                actor.emptyBehaviorList();
                actor.addBehavior(
                        new CAAT.Behavior.GenericBehavior().
                            setValues( actor.width, this.minSize, actor, 'width' ).
                            setFrameTime( this.scene.time, 250 ) ).
                    addBehavior(
                        new CAAT.Behavior.GenericBehavior().
                            setValues( actor.height, this.minSize, actor, 'height' ).
                            setFrameTime( this.scene.time, 250 ) );

                if ( i===this.getNumChildren()-1 ) {
                    actor.behaviorList[0].addListener(
                    {
                        behaviorApplied : function(behavior,time,normalizedTime,targetActor,value) {
                            targetActor.parent.layout();
                        },
                        behaviorExpired : function(behavior,time,targetActor) {
                            for( i=0; i<me.getNumChildren(); i++ ) {
                                actor= me.getChildAt(i);
                                actor.width  = me.minSize;
                                actor.height = me.minSize;
                            }
                            targetActor.parent.layout();
                        }
                    });
                }
            }
        },
        /**
         *
         * Perform the process of pointing a docking actor.
         *
         * @param x {number}
         * @param y {number}
         * @param pointedActor {CAAT.Actor}
         *
         * @private
         */
        actorPointed : function(x, y, pointedActor) {

            var index= this.findChild(pointedActor);
            var c= CAAT.Foundation.UI.Dock;

            var across= 0;
            if ( this.layoutOp===c.OP_LAYOUT_BOTTOM || this.layoutOp===c.OP_LAYOUT_TOP ) {
                across= x / pointedActor.width;
            } else {
                across= y / pointedActor.height;
            }
            var i;

            for( i=0; i<this.childrenList.length; i++ ) {
                var actor= this.childrenList[i];
                actor.emptyBehaviorList();

                var wwidth=0;
                if (i < index - this.range || i > index + this.range) {
                    wwidth = this.minSize;
                } else if (i === index) {
                    wwidth = this.maxSize;
                } else if (i < index) {
                    wwidth=
                        this.minSize +
                        (this.maxSize-this.minSize) *
                        (Math.cos((i - index - across + 1) / this.range * Math.PI) + 1) /
                        2;
                } else {
                    wwidth=
                        this.minSize +
                        (this.maxSize-this.minSize)*
                        (Math.cos( (i - index - across) / this.range * Math.PI) + 1) /
                        2;
                }

                actor.height= wwidth;
                actor.width= wwidth;
            }

            this.layout();
        },
        /**
         * Perform the process of exiting the docking element, that is, animate elements to the minimum
         * size.
         *
         * @param mouseEvent {CAAT.MouseEvent} a CAAT.MouseEvent object.
         *
         * @private
         */
        actorMouseExit : function(mouseEvent) {
            if ( null!==this.ttask ) {
                this.ttask.cancel();
            }

            var me= this;
            this.ttask= this.scene.createTimer(
                    this.scene.time,
                    100,
                    function timeout(sceneTime, time, timerTask) {
                        me.actorNotPointed();
                    },
                    null,
                    null);
        },
        /**
         * Perform the beginning of docking elements.
         * @param mouseEvent {CAAT.MouseEvent} a CAAT.MouseEvent object.
         *
         * @private
         */
        actorMouseEnter : function(mouseEvent) {
            if ( null!==this.ttask ) {
                this.ttask.cancel();
                this.ttask= null;
            }
        },
        /**
         * Adds an actor to Dock.
         * <p>
         * Be aware that actor mouse functions must be set prior to calling this method. The Dock actor
         * needs set his own actor input events functions for mouseEnter, mouseExit and mouseMove and
         * will then chain to the original methods set by the developer.
         *
         * @param actor {CAAT.Actor} a CAAT.Actor instance.
         *
         * @return this
         */
        addChild : function(actor) {
            var me= this;

            actor.__Dock_mouseEnter= actor.mouseEnter;
            actor.__Dock_mouseExit=  actor.mouseExit;
            actor.__Dock_mouseMove=  actor.mouseMove;

            /**
             * @ignore
             * @param mouseEvent
             */
            actor.mouseEnter= function(mouseEvent) {
                me.actorMouseEnter(mouseEvent);
                this.__Dock_mouseEnter(mouseEvent);
            };
            /**
             * @ignore
             * @param mouseEvent
             */
            actor.mouseExit= function(mouseEvent) {
                me.actorMouseExit(mouseEvent);
                this.__Dock_mouseExit(mouseEvent);
            };
            /**
             * @ignore
             * @param mouseEvent
             */
            actor.mouseMove= function(mouseEvent) {
                me.actorPointed( mouseEvent.point.x, mouseEvent.point.y, mouseEvent.source );
                this.__Dock_mouseMove(mouseEvent);
            };

            actor.width= this.minSize;
            actor.height= this.minSize;

            return CAAT.Foundation.UI.Dock.superclass.addChild.call(this,actor);
        }
    }

});
/**
 * See LICENSE file.
 *
 **/

CAAT.Module( {

    /**
     * @name InterpolatorActor
     * @memberOf CAAT.Foundation.UI
     * @extends CAAT.Foundation.Actor
     * @constructor
     */

    defines : "CAAT.Foundation.UI.InterpolatorActor",
    aliases : ["CAAT.InterpolatorActor"],
    depends : [
        "CAAT.Foundation.Actor"
    ],
    extendsClass : "CAAT.Foundation.Actor",
    extendsWith : {

        /**
         * @lends CAAT.Foundation.UI.InterpolatorActor.prototype
         */

        /**
         * The interpolator instance to draw.
         * @type {CAAT.Behavior.Interpolator}
         */
        interpolator:   null,

        /**
         * This interpolator´s contour.
         * @type {Array.<CAAT.Math.Point>}
         */
        contour:        null,   // interpolator contour cache

        /**
         * Number of samples to calculate a contour.
         */
        S:              50,     // contour samples.

        /**
         * padding when drawing the interpolator.
         */
        gap:            5,      // border size in pixels.

        /**
         * Sets a padding border size. By default is 5 pixels.
         * @param gap {number} border size in pixels.
         * @return this
         */
        setGap : function( gap ) {
            this.gap= gap;
            return this;
        },
        /**
         * Sets the CAAT.Interpolator instance to draw.
         *
         * @param interpolator a CAAT.Interpolator instance.
         * @param size an integer indicating the number of polyline segments so draw to show the CAAT.Interpolator
         * instance.
         *
         * @return this
         */
        setInterpolator : function( interpolator, size ) {
            this.interpolator= interpolator;
            this.contour= interpolator.getContour(size || this.S);

            return this;
        },
        /**
         * Paint this actor.
         * @param director {CAAT.Director}
         * @param time {number} scene time.
         */
        paint : function( director, time ) {

            CAAT.InterpolatorActor.superclass.paint.call(this,director,time);

            if ( this.backgroundImage ) {
                return this;
            }

            if ( this.interpolator ) {

                var canvas= director.ctx;

                var xs= (this.width-2*this.gap);
                var ys= (this.height-2*this.gap);

                canvas.beginPath();
                canvas.moveTo(
                        this.gap +  xs*this.contour[0].x,
                        -this.gap + this.height - ys*this.contour[0].y);

                for( var i=1; i<this.contour.length; i++ ) {
                    canvas.lineTo(
                             this.gap + xs*this.contour[i].x,
                            -this.gap + this.height - ys*this.contour[i].y);
                }

                canvas.strokeStyle= this.strokeStyle;
                canvas.stroke();
            }
        },
        /**
         * Return the represented interpolator.
         * @return {CAAT.Interpolator}
         */
        getInterpolator : function() {
            return this.interpolator;
        }
    }


});
CAAT.Module( {

    /**
     * @name Label
     * @memberOf CAAT.Foundation.UI
     * @extends CAAT.Foundation.Actor
     * @constructor
     */

    defines : "CAAT.Foundation.UI.Label",
    depends : [
        "CAAT.Foundation.Actor",
        "CAAT.Foundation.SpriteImage",
        "CAAT.Module.Font.Font",
        "CAAT.Foundation.UI.Layout.LayoutManager"
    ],
    aliases : ["CAAT.UI.Label"],
    extendsClass : "CAAT.Foundation.Actor",
    extendsWith : function() {

        var DEBUG=0;
        var JUSTIFY_RATIO= .6;

        /**
         *
         * Current applied rendering context information.
         */
        var renderContextStyle= function(ctx) {
            this.ctx= ctx;
            return this;
        };

        renderContextStyle.prototype= {

            ctx         : null,

            defaultFS   : null,
            font        : null,
            fontSize    : null,
            fill        : null,
            stroke      : null,
            filled      : null,
            stroked     : null,
            strokeSize  : null,
            italic      : null,
            bold        : null,
            alignment   : null,
            tabSize     : null,
            shadow      : null,
            shadowBlur  : null,
            shadowColor : null,

            sfont       : null,

            chain       : null,

            setDefault : function( defaultStyles ) {
                this.defaultFS  =   24;
                this.font       =   "Arial";
                this.fontSize   =   this.defaultFS;
                this.fill       =   '#000';
                this.stroke     =   '#f00';
                this.filled     =   true;
                this.stroked    =   false;
                this.strokeSize =   1;
                this.italic     =   false;
                this.bold       =   false;
                this.alignment  =   "left";
                this.tabSize    =   75;
                this.shadow     =   false;
                this.shadowBlur =   0;
                this.shadowColor=   "#000";

                for( var style in defaultStyles ) {
                    if ( defaultStyles.hasOwnProperty(style) ) {
                        this[style]= defaultStyles[style];
                    }
                }

                this.__setFont();

                return this;
            },

            setStyle : function( styles ) {
                if ( typeof styles!=="undefined" ) {
                    for( var style in styles ) {
                        this[style]= styles[style];
                    }
                }
                return this;
            },

            applyStyle : function() {
                this.__setFont();

                return this;
            },

            clone : function( ) {
                var c= new renderContextStyle( this.ctx );
                var pr;
                for( pr in this ) {
                    if ( this.hasOwnProperty(pr) ) {
                        c[pr]= this[pr];
                    }
                }
                /*
                c.defaultFS  =   this.defaultFS;
                c.font       =   this.font;
                c.fontSize   =   this.fontSize;
                c.fill       =   this.fill;
                c.stroke     =   this.stroke;
                c.filled     =   this.filled;
                c.stroked    =   this.stroked;
                c.strokeSize =   this.strokeSize;
                c.italic     =   this.italic;
                c.bold       =   this.bold;
                c.alignment  =   this.alignment;
                c.tabSize    =   this.tabSize;
                */

                var me= this;
                while( me.chain ) {
                    me= me.chain;
                    for( pr in me ) {
                        if ( c[pr]===null  && me.hasOwnProperty(pr) ) {
                            c[pr]= me[pr];
                        }
                    }
                }

                c.__setFont();

                return c;
            },

            __getProperty : function( prop ) {
                var me= this;
                var res;
                do {
                    res= me[prop];
                    if ( res!==null ) {
                        return res;
                    }
                    me= me.chain;
                } while( me );

                return null;
            },

            image : function( ctx ) {
                this.__setShadow( ctx );
            },

            text : function( ctx, text, x, y ) {

                this.__setShadow( ctx );

                ctx.font= this.__getProperty("sfont");

                if ( this.filled ) {
                    this.__fillText( ctx,text,x,y );
                }
                if ( this.stroked ) {
                    this.__strokeText( ctx,text,x,y );
                }
            },

            __setShadow : function( ctx ) {
                if ( this.__getProperty("shadow" ) ) {
                    ctx.shadowBlur= this.__getProperty("shadowBlur");
                    ctx.shadowColor= this.__getProperty("shadowColor");
                }
            },

            __fillText : function( ctx, text, x, y ) {
                ctx.fillStyle= this.__getProperty("fill");
                ctx.fillText( text, x, y );
            },

            __strokeText : function( ctx, text, x, y ) {
                ctx.strokeStyle= this.__getProperty("stroke");
                ctx.lineWidth= this.__getProperty("strokeSize");
                ctx.beginPath();
                ctx.strokeText( text, x, y );
            },

            __setFont : function() {
                var italic= this.__getProperty("italic");
                var bold= this.__getProperty("bold");
                var fontSize= this.__getProperty("fontSize");
                var font= this.__getProperty("font");

                this.sfont= (italic ? "italic " : "") +
                    (bold ? "bold " : "") +
                    fontSize + "px " +
                    font;

                this.ctx.font= this.__getProperty("sfont");
            },

            setBold : function( bool ) {
                if ( bool!=this.bold ) {
                    this.bold= bool;
                    this.__setFont();
                }
            },

            setItalic : function( bool ) {
                if ( bool!=this.italic ) {
                    this.italic= bool;
                    this.__setFont();
                }
            },

            setStroked : function( bool ) {
                this.stroked= bool;
            },

            setFilled : function( bool ) {
                this.filled= bool;
            },

            getTabPos : function( x ) {
                var ts= this.__getProperty("tabSize");
                return (((x/ts)>>0)+1)*ts;
            },

            setFillStyle : function( style ) {
                this.fill= style;
            },

            setStrokeStyle : function( style ) {
                this.stroke= style;
            },

            setStrokeSize : function( size ) {
                this.strokeSize= size;
            },

            setAlignment : function( alignment ) {
                this.alignment= alignment;
            },

            setFontSize : function( size ) {
                if ( size!==this.fontSize ) {
                    this.fontSize= size;
                    this.__setFont();
                }
            }
        };

        /**
         * This class keeps track of styles, images, and the current applied style.
         */
        var renderContext= function() {
            this.text= "";
            return this;
        };

        renderContext.prototype= {

            x           :   0,
            y           :   0,
            width       :   0,
            text        :   null,

            crcs        :   null,   // current rendering context style
            rcs         :   null,   // rendering content styles stack

            styles      :   null,
            images      :   null,

            lines       :   null,

            documentHeight  : 0,

            anchorStack     : null,

            __nextLine : function() {
                this.x= 0;
                this.currentLine= new DocumentLine(
                    CAAT.Module.Font.Font.getFontMetrics( this.crcs.sfont)  );
                this.lines.push( this.currentLine );
            },

            /**
             *
             * @param image {CAAT.SpriteImage}
             * @param r {number=}
             * @param c {number=}
             * @private
             */
            __image : function( image, r, c ) {


                var image_width;

                if ( typeof r!=="undefined" && typeof c!=="undefined" ) {
                    image_width= image.getWidth();
                } else {
                    image_width= ( image instanceof CAAT.Foundation.SpriteImage ) ? image.getWidth() : image.getWrappedImageWidth();
                }

                // la imagen cabe en este sitio.
                if ( this.width ) {
                    if ( image_width + this.x > this.width && this.x>0 ) {
                        this.__nextLine();
                    }
                }

                this.currentLine.addElementImage( new DocumentElementImage(
                    this.x,
                    image,
                    r,
                    c,
                    this.crcs.clone(),
                    this.__getCurrentAnchor() ) );

                this.x+= image_width;
            },

            __text : function() {

                if ( this.text.length===0 ) {
                    return;
                }

                var text_width= this.ctx.measureText(this.text).width;

                // la palabra cabe en este sitio.
                if ( this.width ) {
                    if ( text_width + this.x > this.width && this.x>0 ) {
                        this.__nextLine();
                    }
                }

                //this.crcs.text( this.text, this.x, this.y );
                this.currentLine.addElement( new DocumentElementText(
                    this.text,
                    this.x,
                    text_width,
                    0, //this.crcs.__getProperty("fontSize"), calculated later
                    this.crcs.clone(),
                    this.__getCurrentAnchor() ) ) ;

                this.x+= text_width;

                this.text="";
            },

            fchar : function( _char ) {

                if ( _char===' ' ) {

                    this.__text();

                    this.x+= this.ctx.measureText(_char).width;
                    if ( this.width ) {
                        if ( this.x > this.width ) {
                            this.__nextLine();
                        }
                    }
                } else {
                    this.text+= _char;
                }
            },

            end : function() {
                if ( this.text.length>0 ) {
                    this.__text();
                }

                var y=0;
                var lastLineEstimatedDescent= 0;
                for( var i=0; i<this.lines.length; i++ ) {
                    var inc= this.lines[i].getHeight();

                    if ( inc===0 ) {
                        // lineas vacias al menos tienen tamaño del estilo por defecto
                        inc= this.styles["default"].fontSize;
                    }
                    y+= inc;

                    /**
                     * add the estimated descent of the last text line to document height's.
                     * the descent is estimated to be a 20% of font's height.
                     */
                    if ( i===this.lines.length-1 ) {
                        lastLineEstimatedDescent= (inc*.25)>>0;
                    }

                    this.lines[i].setY(y);
                }

                this.documentHeight= y + lastLineEstimatedDescent;
            },

            getDocumentHeight : function() {
                return this.documentHeight;
            },

            __getCurrentAnchor : function() {
                if ( this.anchorStack.length ) {
                    return this.anchorStack[ this.anchorStack.length-1 ];
                }

                return null;
            },

            __resetAppliedStyles : function() {
                this.rcs= [];
                this.__pushDefaultStyles();
            },

            __pushDefaultStyles : function() {
                this.crcs= new renderContextStyle(this.ctx).setDefault( this.styles["default"] );
                this.rcs.push( this.crcs );
            },

            __pushStyle : function( style ) {
                var pcrcs= this.crcs;
                this.crcs= new renderContextStyle(this.ctx);
                this.crcs.chain= pcrcs;
                this.crcs.setStyle( style );
                this.crcs.applyStyle( );

                this.rcs.push( this.crcs );
            },

            __popStyle : function() {
                // make sure you don't remove default style.
                if ( this.rcs.length>1 ) {
                    this.rcs.pop();
                    this.crcs= this.rcs[ this.rcs.length-1 ];
                    this.crcs.applyStyle();
                }
            },

            __popAnchor : function() {
                if ( this.anchorStack.length> 0 ) {
                    this.anchorStack.pop();
                }
            },

            __pushAnchor : function( anchor ) {
                this.anchorStack.push( anchor );
            },

            start : function( ctx, styles, images, width ) {
                this.x=0;
                this.y=0;
                this.width= typeof width!=="undefined" ? width : 0;
                this.ctx= ctx;
                this.lines= [];
                this.styles= styles;
                this.images= images;
                this.anchorStack= [];

                this.__resetAppliedStyles();
                this.__nextLine();

            },

            setTag  : function( tag ) {

                var pairs, style;

                this.__text();

                tag= tag.toLowerCase();
                if ( tag==='b' ) {
                    this.crcs.setBold( true );
                } else if ( tag==='/b' ) {
                    this.crcs.setBold( false );
                } else if ( tag==='i' ) {
                    this.crcs.setItalic( true );
                } else if ( tag==='/i' ) {
                    this.crcs.setItalic( false );
                } else if ( tag==='stroked' ) {
                    this.crcs.setStroked( true );
                } else if ( tag==='/stroked' ) {
                    this.crcs.setStroked( false );
                } else if ( tag==='filled' ) {
                    this.crcs.setFilled( true );
                } else if ( tag==='/filled' ) {
                    this.crcs.setFilled( false );
                } else if ( tag==='tab' ) {
                    this.x= this.crcs.getTabPos( this.x );
                } else if ( tag==='br' ) {
                    this.__nextLine();
                } else if ( tag==='/a' ) {
                    this.__popAnchor();
                } else if ( tag==='/style' ) {
                    if ( this.rcs.length>1 ) {
                        this.__popStyle();
                    } else {
                        /**
                         * underflow pop de estilos. eres un cachondo.
                         */
                    }
                } else {
                    if ( tag.indexOf("fillcolor")===0 ) {
                        pairs= tag.split("=");
                        this.crcs.setFillStyle( pairs[1] );
                    } else if ( tag.indexOf("strokecolor")===0 ) {
                        pairs= tag.split("=");
                        this.crcs.setStrokeStyle( pairs[1] );
                    } else if ( tag.indexOf("strokesize")===0 ) {
                        pairs= tag.split("=");
                        this.crcs.setStrokeSize( pairs[1]|0 );
                    } else if ( tag.indexOf("fontsize")===0 ) {
                        pairs= tag.split("=");
                        this.crcs.setFontSize( pairs[1]|0 );
                    } else if ( tag.indexOf("style")===0 ) {
                        pairs= tag.split("=");
                        style= this.styles[ pairs[1] ];
                        if ( style ) {
                            this.__pushStyle( style );
                        }
                    } else if ( tag.indexOf("image")===0) {
                        pairs= tag.split("=")[1].split(",");
                        var image= pairs[0];
                        if ( this.images[image] ) {
                            var r= 0, c=0;
                            if ( pairs.length>=3 ) {
                                r= pairs[1]|0;
                                c= pairs[2]|0;
                            }
                            this.__image( this.images[image], r, c );
                        } else if (CAAT.currentDirector.getImage(image) ) {
                            this.__image( CAAT.currentDirector.getImage(image) );
                        }
                    } else if ( tag.indexOf("a=")===0 ) {
                        pairs= tag.split("=");
                        this.__pushAnchor( pairs[1] );
                    }
                }
            }
        };

        /**
         * Abstract document element.
         * The document contains a collection of DocumentElementText and DocumentElementImage.
         * @param anchor
         * @param style
         */
        var DocumentElement= function( anchor, style ) {
            this.link= anchor;
            this.style= style;
            return this;
        };

        DocumentElement.prototype= {
            x       : null,
            y       : null,
            width   : null,
            height  : null,

            style   : null,

            link    : null,

            isLink : function() {
                return this.link;
            },

            setLink : function( link ) {
                this.link= link;
                return this;
            },

            getLink : function() {
                return this.link;
            },

            contains : function(x,y) {
                return false;
            }

        };

        /**
         * This class represents an image in the document.
         * @param x
         * @param image
         * @param r
         * @param c
         * @param style
         * @param anchor
         */
        var DocumentElementImage= function( x, image, r, c, style, anchor ) {

            DocumentElementImage.superclass.constructor.call(this, anchor, style);

            this.x= x;
            this.image= image;
            this.row= r;
            this.column= c;
            this.width= image.getWidth();
            this.height= image.getHeight();

            if ( this.image instanceof CAAT.SpriteImage || this.image instanceof CAAT.Foundation.SpriteImage ) {

                if ( typeof r==="undefined" || typeof c==="undefined" ) {
                    this.spriteIndex= 0;
                } else {
                    this.spriteIndex= r*image.columns+c;
                }
                this.paint= this.paintSI;
            }

            return this;
        };

        DocumentElementImage.prototype= {
            image   : null,
            row     : null,
            column  : null,
            spriteIndex : null,

            paint : function( ctx ) {
                this.style.image( ctx );
                ctx.drawImage( this.image, this.x, -this.height+1);
                if ( DEBUG ) {
                    ctx.strokeRect( this.x, -this.height+1, this.width, this.height );
                }
            },

            paintSI : function( ctx ) {
                this.style.image( ctx );
                this.image.setSpriteIndex( this.spriteIndex );
                this.image.paint( { ctx: ctx }, 0, this.x,  -this.height+1 );
                if ( DEBUG ) {
                    ctx.strokeRect( this.x, -this.height+1, this.width, this.height );
                }
            },

            getHeight : function() {
                return this.image instanceof CAAT.Foundation.SpriteImage ? this.image.getHeight() : this.image.height;
            },

            getFontMetrics : function() {
                return null;
            },

            contains : function(x,y) {
                return x>=this.x && x<=this.x+this.width && y>=this.y && y<this.y + this.height;
            },

            setYPosition : function( baseline ) {
                this.y= baseline - this.height + 1;
            }

        };

        /**
         * This class represents a text in the document. The text will have applied the styles selected
         * when it was defined.
         * @param text
         * @param x
         * @param width
         * @param height
         * @param style
         * @param anchor
         */
        var DocumentElementText= function( text,x,width,height,style, anchor) {

            DocumentElementText.superclass.constructor.call(this, anchor, style);

            this.x=         x;
            this.y=         0;
            this.width=     width;
            this.text=      text;
            this.style=     style;
            this.fm=        CAAT.Module.Font.Font.getFontMetrics( style.sfont );
            this.height=    this.fm.height;

            return this;
        };

        DocumentElementText.prototype= {

            text    : null,
            style   : null,
            fm      : null,

            bl      : null,     // where baseline was set. current 0 in ctx.

            paint : function( ctx ) {
                this.style.text( ctx, this.text, this.x, 0 );
                if ( DEBUG ) {
                    ctx.strokeRect( this.x, -this.fm.ascent, this.width, this.height);
                }
            },

            getHeight : function() {
                return this.fm.height;
            },

            getFontMetrics : function() {
                return this.fm; //CAAT.Font.getFontMetrics( this.style.sfont);
            },

            contains : function( x, y ) {
                return x>= this.x && x<=this.x+this.width &&
                    y>= this.y && y<= this.y+this.height;
            },

            setYPosition : function( baseline ) {
                this.bl= baseline;
                this.y= baseline - this.fm.ascent;
            }
        };

        extend( DocumentElementImage, DocumentElement );
        extend( DocumentElementText, DocumentElement );

        /**
         * This class represents a document line.
         * It contains a collection of DocumentElement objects.
         */
        var DocumentLine= function( defaultFontMetrics ) {
            this.elements= [];
            this.defaultFontMetrics= defaultFontMetrics;
            return this;
        };

        DocumentLine.prototype= {
            elements    : null,
            width       : 0,
            height      : 0,
            defaultHeight : 0,  // default line height in case it is empty.
            y           : 0,
            x           : 0,
            alignment   : null,

            baselinePos : 0,

            addElement : function( element ) {
                this.width= Math.max( this.width, element.x + element.width );
                this.height= Math.max( this.height, element.height );
                this.elements.push( element );
                this.alignment= element.style.__getProperty("alignment");
            },

            addElementImage : function( element ) {
                this.width= Math.max( this.width, element.x + element.width );
                this.height= Math.max( this.height, element.height );
                this.elements.push( element );
            },

            getHeight : function() {
                return this.height;
            },

            setY : function( y ) {
                this.y= y;
            },

            getY : function() {
                return this.y;
            },

            paint : function( ctx ) {
                ctx.save();
                ctx.translate(this.x,this.y + this.baselinePos );

                for( var i=0; i<this.elements.length; i++ ) {
                    this.elements[i].paint(ctx);
                }

                ctx.restore();

            },

            setAlignment : function( width ) {
                var j;

                if ( this.alignment==="center" ) {
                    this.x= (width - this.width)/2;
                } else if ( this.alignment==="right" ) {
                    this.x= width - this.width;
                } else if ( this.alignment==="justify" ) {

                    // justify: only when text overflows further than document's 80% width
                    if ( this.width / width >= JUSTIFY_RATIO && this.elements.length>1 ) {
                        var remaining= width - this.width;

                        var forEachElement= (remaining/(this.elements.length-1))|0;
                        for( j=1; j<this.elements.length ; j++ ) {
                            this.elements[j].x+= j*forEachElement;
                        }

                        remaining= width - this.width - forEachElement*(this.elements.length-1);
                        for( j=0; j<remaining; j++ ) {
                            this.elements[this.elements.length-1-j].x+= remaining-j;
                        }
                    }
                }
            },

            adjustHeight : function() {
                var biggestFont=null;
                var biggestImage=null;
                var i;

                for( i=0; i<this.elements.length; i+=1 ) {
                    var elem= this.elements[i];

                    var fm= elem.getFontMetrics();
                    if ( null!=fm ) {           // gest a fontMetrics, is a DocumentElementText (text)
                        if ( !biggestFont ) {
                            biggestFont= fm;
                        } else {
                            if ( fm.ascent > biggestFont.ascent ) {
                                biggestFont= fm;
                            }
                        }
                    } else {                    // no FontMetrics, it is an image.
                        if (!biggestImage) {
                            biggestImage= elem;
                        } else {
                            if ( elem.getHeight() > elem.getHeight() ) {
                                biggestImage= elem;
                            }
                        }
                    }
                }

                this.baselinePos= Math.max(
                    biggestFont ? biggestFont.ascent : this.defaultFontMetrics.ascent,
                    biggestImage ? biggestImage.getHeight() : this.defaultFontMetrics.ascent );
                this.height= this.baselinePos + (biggestFont!=null ? biggestFont.descent : this.defaultFontMetrics.descent );

                for( i=0; i<this.elements.length; i++ ) {
                    this.elements[i].setYPosition( this.baselinePos );
                }

                return this.height;
            },

            /**
             * Every element is positioned at line's baseline.
             * @param x
             * @param y
             * @private
             */
            __getElementAt : function( x, y ) {
                for( var i=0; i<this.elements.length; i++ ) {
                    var elem= this.elements[i];
                    if ( elem.contains(x,y) ) {
                        return elem;
                    }
                }

                return null;
            }
        };

        return {

            /**
             * @lends CAAT.Foundation.UI.Label.prototype
             */


            __init : function() {
                this.__super();

                this.rc= new renderContext();
                this.lines= [];
                this.styles= {};
                this.images= {};

                return this;
            },

            /**
             * This Label document´s horizontal alignment.
             * @type {CAAT.Foundation.UI.Layout.LayoutManager}
             * @private
             */
            halignment  :   CAAT.Foundation.UI.Layout.LayoutManager.ALIGNMENT.LEFT,

            /**
             * This Label document´s vertical alignment.
             * @type {CAAT.Foundation.UI.Layout.LayoutManager}
             * @private
             */
            valignment  :   CAAT.Foundation.UI.Layout.LayoutManager.ALIGNMENT.TOP,

            /**
             * This label text.
             * @type {string}
             * @private
             */
            text        :   null,

            /**
             * This label document´s render context
             * @type {RenderContext}
             * @private
             */
            rc          :   null,

            /**
             * Styles object.
             * @private
             */
            styles      :   null,

            /**
             * Calculated document width.
             * @private
             */
            documentWidth   : 0,

            /**
             * Calculated document Height.
             * @private
             */
            documentHeight  : 0,

            /**
             * Document x position.
             * @private
             */
            documentX       : 0,

            /**
             * Document y position.
             * @private
             */
            documentY       : 0,

            /**
             * Does this label document flow ?
             * @private
             */
            reflow      :   true,

            /**
             * Collection of text lines calculated for the label.
             * @private
             */
            lines       :   null,   // calculated elements lines...

            /**
             * Collection of image objects in this label´s document.
             * @private
             */
            images      :   null,

            /**
             * Registered callback to notify on anchor click event.
             * @private
             */
            clickCallback   : null,

            matchTextSize : true,

            /**
             * Make the label actor the size the label document has been calculated for.
             * @param match {boolean}
             */
            setMatchTextSize : function( match ) {
                this.matchTextSize= match;
                if ( match ) {
                    this.width= this.preferredSize.width;
                    this.height= this.preferredSize.height;
                }
            },

            setStyle : function( name, styleData ) {
                this.styles[ name ]= styleData;
                return this;
            },

            addImage : function( name, spriteImage ) {
                this.images[ name ]= spriteImage;
                return this;
            },

            setSize : function(w,h) {
                CAAT.Foundation.UI.Label.superclass.setSize.call( this, w, h );
                this.setText( this.text, this.width );
                return this;
            },

            setBounds : function( x,y,w,h ) {
                CAAT.Foundation.UI.Label.superclass.setBounds.call( this,x,y,w,h );
                this.setText( this.text, this.width );
                return this;
            },

            setText : function( _text, width ) {

                if ( null===_text ) {
                   return;
                }

                var cached= this.cached;
                if ( cached ) {
                    this.stopCacheAsBitmap();
                }

                this.documentWidth= 0;
                this.documentHeight= 0;

                this.text= _text;

                var i, l, text;
                var tag_closes_at_pos, tag;
                var _char;
                var ctx= CAAT.currentDirector.ctx;
                ctx.save();

                text= this.text;

                i=0;
                l=text.length;

                this.rc.start( ctx, this.styles, this.images, width );

                while( i<l ) {
                    _char= text.charAt(i);

                    if ( _char==='\\' ) {
                        i+=1;
                        this.rc.fchar( text.charAt(i) );
                        i+=1;

                    } else if ( _char==='<' ) {   // try an enhancement.

                        // try finding another '>' and see whether it matches a tag
                        tag_closes_at_pos= text.indexOf('>', i+1);
                        if ( -1!==tag_closes_at_pos ) {
                            tag= text.substr( i+1, tag_closes_at_pos-i-1 );
                            if ( tag.indexOf("<")!==-1 ) {
                                this.rc.fchar( _char );
                                i+=1;
                            } else {
                                this.rc.setTag( tag );
                                i= tag_closes_at_pos+1;
                            }
                        }
                    } else {
                        this.rc.fchar( _char );
                        i+= 1;
                    }
                }

                this.rc.end();
                this.lines= this.rc.lines;

                this.__calculateDocumentDimension( typeof width==="undefined" ? 0 : width );
                this.setLinesAlignment();

                ctx.restore();

                this.setPreferredSize( this.documentWidth, this.documentHeight );
                this.invalidateLayout();

                this.setDocumentPosition();

                if ( cached ) {
                    this.cacheAsBitmap(0,cached);
                }

                if ( this.matchTextSize ) {
                    this.width= this.preferredSize.width;
                    this.height= this.preferredSize.height;
                }

                return this;
            },

            setVerticalAlignment : function( align ) {
                this.valignment= align;
                this.setDocumentPosition();
                return this;
            },

            setHorizontalAlignment : function( align ) {
                this.halignment= align;
                this.setDocumentPosition();
                return this;
            },

            setDocumentPosition : function( halign, valign ) {

                if ( typeof halign!=="undefined" ) {
                    this.setHorizontalAlignment(halign);
                }
                if ( typeof valign!=="undefined" ) {
                    this.setVerticalAlignment(valign);
                }

                var xo=0, yo=0;

                if ( this.valignment===CAAT.Foundation.UI.Layout.LayoutManager.ALIGNMENT.CENTER ) {
                    yo= (this.height - this.documentHeight )/2;
                } else if ( this.valignment===CAAT.Foundation.UI.Layout.LayoutManager.ALIGNMENT.BOTTOM ) {
                    yo= this.height - this.documentHeight;
                }

                if ( this.halignment===CAAT.Foundation.UI.Layout.LayoutManager.ALIGNMENT.CENTER ) {
                    xo= (this.width - this.documentWidth )/2;
                } else if ( this.halignment===CAAT.Foundation.UI.Layout.LayoutManager.ALIGNMENT.RIGHT ) {
                    xo= this.width - this.documentWidth;
                }

                this.documentX= xo;
                this.documentY= yo;
            },

            __calculateDocumentDimension : function( suggestedWidth ) {
                var i;
                var y= 0;

                this.documentWidth= 0;
                this.documentHeight= 0;
                for( i=0; i<this.lines.length; i++ ) {
                    this.lines[i].y =y;
                    this.documentWidth= Math.max( this.documentWidth, this.lines[i].width );
                    this.documentHeight+= this.lines[i].adjustHeight();
                    y+= this.lines[i].getHeight();
                }

                this.documentWidth= Math.max( this.documentWidth, suggestedWidth );

                return this;
            },

            setLinesAlignment : function() {

                for( var i=0; i<this.lines.length; i++ ) {
                    this.lines[i].setAlignment( this.documentWidth )
                }
            },

            paint : function( director, time ) {

                if ( this.cached===CAAT.Foundation.Actor.CACHE_NONE ) {
                    var ctx= director.ctx;

                    ctx.save();

                    ctx.textBaseline="alphabetic";
                    ctx.translate( this.documentX, this.documentY );

                    for( var i=0; i<this.lines.length; i++ ) {
                        var line= this.lines[i];
                        line.paint( director.ctx );

                        if ( DEBUG ) {
                            ctx.strokeRect( line.x, line.y, line.width, line.height );
                        }
                    }

                    ctx.restore();
                } else {
                    if ( this.backgroundImage ) {
                        this.backgroundImage.paint(director,time,0,0);
                    }
                }
            },

            __getDocumentElementAt : function( x, y ) {

                x-= this.documentX;
                y-= this.documentY;

                for( var i=0; i<this.lines.length; i++ ) {
                    var line= this.lines[i];

                    if ( line.x<=x && line.y<=y && line.x+line.width>=x && line.y+line.height>=y ) {
                        return line.__getElementAt( x - line.x, y - line.y );
                    }
                }

                return null;
            },

            mouseExit : function(e) {
                CAAT.setCursor( "default");
            },

            mouseMove : function(e) {
                var elem= this.__getDocumentElementAt(e.x, e.y);
                if ( elem && elem.getLink() ) {
                    CAAT.setCursor( "pointer");
                } else {
                    CAAT.setCursor( "default");
                }
            },

            mouseClick : function(e) {
                if ( this.clickCallback ) {
                    var elem= this.__getDocumentElementAt(e.x, e.y);
                    if ( elem.getLink() ) {
                        this.clickCallback( elem.getLink() );
                    }
                }
            },

            setClickCallback : function( callback ) {
                this.clickCallback= callback;
                return this;
            }
        }

    }

});
/**
 * See LICENSE file.
 *
 * An actor to show the path and its handles in the scene graph. 
 *
 **/
CAAT.Module( {

    /**
     * @name PathActor
     * @memberOf CAAT.Foundation.UI
     * @extends CAAT.Foundation.Actor
     * @constructor
     */

    defines : "CAAT.Foundation.UI.PathActor",
    aliases : ["CAAT.PathActor"],
    depends : [
        "CAAT.Foundation.Actor"
    ],
    extendsClass : "CAAT.Foundation.Actor",
    extendsWith : {

        /**
         * @lends CAAT.Foundation.UI.PathActor.prototype
         */

        /**
         * Path to draw.
         * @type {CAAT.PathUtil.Path}
         */
		path                    : null,

        /**
         * Calculated path´s bounding box.
         */
		pathBoundingRectangle   : null,

        /**
         * draw the bounding rectangle too ?
         */
		bOutline                : false,

        /**
         * Outline the path in this color.
         */
        outlineColor            : 'black',

        /**
         * If the path is interactive, some handlers are shown to modify the path.
         * This callback function will be called when the path is interactively changed.
         */
        onUpdateCallback        : null,

        /**
         * Set this path as interactive.
         */
        interactive             : false,

        /**
         * Return the contained path.
         * @return {CAAT.Path}
         */
        getPath : function() {
            return this.path;
        },

        /**
         * Sets the path to manage.
         * @param path {CAAT.PathUtil.PathSegment}
         * @return this
         */
		setPath : function(path) {
			this.path= path;
            if ( path!=null ) {
			    this.pathBoundingRectangle= path.getBoundingBox();
                this.setInteractive( this.interactive );
            }
            return this;
		},
        /**
         * Paint this actor.
         * @param director {CAAT.Foundation.Director}
         * @param time {number}. Scene time.
         */
		paint : function(director, time) {

            CAAT.Foundation.UI.PathActor.superclass.paint.call( this, director, time );

            if ( !this.path ) {
                return;
            }

            var ctx= director.ctx;

            ctx.strokeStyle='#000';
			this.path.paint(director, this.interactive);

            if ( this.bOutline ) {
                ctx.strokeStyle= this.outlineColor;
                ctx.strokeRect(
                    this.pathBoundingRectangle.x,
                    this.pathBoundingRectangle.y,
                    this.pathBoundingRectangle.width,
                    this.pathBoundingRectangle.height
                );
            }
		},
        /**
         * Enables/disables drawing of the contained path's bounding box.
         * @param show {boolean} whether to show the bounding box
         * @param color {=string} optional parameter defining the path's bounding box stroke style.
         */
        showBoundingBox : function(show, color) {
            this.bOutline= show;
            if ( show && color ) {
                this.outlineColor= color;
            }
            return this;
        },
        /**
         * Set the contained path as interactive. This means it can be changed on the fly by manipulation
         * of its control points.
         * @param interactive
         */
        setInteractive : function(interactive) {
            this.interactive= interactive;
            if ( this.path ) {
                this.path.setInteractive(interactive);
            }
            return this;
        },
        setOnUpdateCallback : function( fn ) {
            this.onUpdateCallback= fn;
            return this;
        },
        /**
         * Route mouse dragging functionality to the contained path.
         * @param mouseEvent {CAAT.Event.MouseEvent}
         */
		mouseDrag : function(mouseEvent) {
			this.path.drag(mouseEvent.point.x, mouseEvent.point.y, this.onUpdateCallback);
		},
        /**
         * Route mouse down functionality to the contained path.
         * @param mouseEvent {CAAT.Event.MouseEvent}
         */
		mouseDown : function(mouseEvent) {
			this.path.press(mouseEvent.point.x, mouseEvent.point.y);
		},
        /**
         * Route mouse up functionality to the contained path.
         * @param mouseEvent {CAAT.Event.MouseEvent}
         */
		mouseUp : function(mouseEvent) {
			this.path.release();
		}
	}
});
CAAT.Module({

    /**
     * @name ShapeActor
     * @memberOf CAAT.Foundation.UI
     * @extends CAAT.Foundation.ActorContainer
     * @constructor
     */

    defines : "CAAT.Foundation.UI.ShapeActor",
    aliases : ["CAAT.ShapeActor"],
    extendsClass : "CAAT.Foundation.ActorContainer",
    depends : [
        "CAAT.Foundation.ActorContainer"
    ],
    constants : {

        /**
         * @lends CAAT.Foundation.UI.ShapeActor
         */

        /** @const */ SHAPE_CIRCLE:   0,      // Constants to describe different shapes.
        /** @const */ SHAPE_RECTANGLE:1
    },
    extendsWith : {

        /**
         * @lends CAAT.Foundation.UI.ShapeActor.prototype
         */

        __init : function() {
            this.__super();
            this.compositeOp= 'source-over';

            /**
             * Thanks Svend Dutz and Thomas Karolski for noticing this call was not performed by default,
             * so if no explicit call to setShape was made, nothing would be drawn.
             */
            this.setShape( CAAT.Foundation.UI.ShapeActor.SHAPE_CIRCLE );
            return this;
        },

        /**
         * Define this actor shape: rectangle or circle
         */
        shape:          0,      // shape type. One of the constant SHAPE_* values

        /**
         * Set this shape composite operation when drawing it.
         */
        compositeOp:    null,   // a valid canvas rendering context string describing compositeOps.

        /**
         * Stroke the shape with this line width.
         */
        lineWidth:      1,

        /**
         * Stroke the shape with this line cap.
         */
        lineCap:        null,

        /**
         * Stroke the shape with this line Join.
         */
        lineJoin:       null,

        /**
         * Stroke the shape with this line mitter limit.
         */
        miterLimit:     null,

        /**
         * 
         * @param l {number>0}
         */
        setLineWidth : function(l)  {
            this.lineWidth= l;
            return this;
        },
        /**
         *
         * @param lc {string{butt|round|square}}
         */
        setLineCap : function(lc)   {
            this.lineCap= lc;
            return this;
        },
        /**
         *
         * @param lj {string{bevel|round|miter}}
         */
        setLineJoin : function(lj)  {
            this.lineJoin= lj;
            return this;
        },
        /**
         *
         * @param ml {integer>0}
         */
        setMiterLimit : function(ml)    {
            this.miterLimit= ml;
            return this;
        },
        getLineCap : function() {
            return this.lineCap;
        },
        getLineJoin : function()    {
            return this.lineJoin;
        },
        getMiterLimit : function()  {
            return this.miterLimit;
        },
        getLineWidth : function()   {
            return this.lineWidth;
        },
        /**
         * Sets shape type.
         * No check for parameter validity is performed.
         * Set paint method according to the shape.
         * @param iShape an integer with any of the SHAPE_* constants.
         * @return this
         */
        setShape : function(iShape) {
            this.shape= iShape;
            this.paint= this.shape===CAAT.Foundation.UI.ShapeActor.SHAPE_CIRCLE ?
                    this.paintCircle :
                    this.paintRectangle;
            return this;
        },
        /**
         * Sets the composite operation to apply on shape drawing.
         * @param compositeOp an string with a valid canvas rendering context string describing compositeOps.
         * @return this
         */
        setCompositeOp : function(compositeOp){
            this.compositeOp= compositeOp;
            return this;
        },
        /**
         * Draws the shape.
         * Applies the values of fillStype, strokeStyle, compositeOp, etc.
         *
         * @param director a valid CAAT.Director instance.
         * @param time an integer with the Scene time the Actor is being drawn.
         */
        paint : function(director,time) {
        },
        /**
         * @private
         * Draws a circle.
         * @param director a valid CAAT.Director instance.
         * @param time an integer with the Scene time the Actor is being drawn.
         */
        paintCircle : function(director,time) {

            if ( this.cached ) {
                CAAT.Foundation.ActorContainer.prototype.paint.call( this, director, time );
                return;
            }

            var ctx= director.ctx;

            ctx.lineWidth= this.lineWidth;

            ctx.globalCompositeOperation= this.compositeOp;
            if ( null!==this.fillStyle ) {
                ctx.fillStyle= this.fillStyle;
                ctx.beginPath();
                ctx.arc( this.width/2, this.height/2, Math.min(this.width,this.height)/2- this.lineWidth/2, 0, 2*Math.PI, false );
                ctx.fill();
            }

            if ( null!==this.strokeStyle ) {
                ctx.strokeStyle= this.strokeStyle;
                ctx.beginPath();
                ctx.arc( this.width/2, this.height/2, Math.min(this.width,this.height)/2- this.lineWidth/2, 0, 2*Math.PI, false );
                ctx.stroke();
            }
        },
        /**
         *
         * Private
         * Draws a Rectangle.
         *
         * @param director a valid CAAT.Director instance.
         * @param time an integer with the Scene time the Actor is being drawn.
         */
        paintRectangle : function(director,time) {

            if ( this.cached ) {
                CAAT.Foundation.ActorContainer.prototype.paint.call( this, director, time );
                return;
            }

            var ctx= director.ctx;

            ctx.lineWidth= this.lineWidth;

            if ( this.lineCap ) {
                ctx.lineCap= this.lineCap;
            }
            if ( this.lineJoin )    {
                ctx.lineJoin= this.lineJoin;
            }
            if ( this.miterLimit )  {
                ctx.miterLimit= this.miterLimit;
            }

            ctx.globalCompositeOperation= this.compositeOp;
            if ( null!==this.fillStyle ) {
                ctx.fillStyle= this.fillStyle;
                ctx.beginPath();
                ctx.fillRect(0,0,this.width,this.height);
                ctx.fill();
            }

            if ( null!==this.strokeStyle ) {
                ctx.strokeStyle= this.strokeStyle;
                ctx.beginPath();
                ctx.strokeRect(0,0,this.width,this.height);
                ctx.stroke();
            }
        }
    }

});
CAAT.Module( {

    /**
     * @name StarActor
     * @memberOf CAAT.Foundation.UI
     * @extends CAAT.Foundation.ActorContainer
     * @constructor
     */

    defines : "CAAT.Foundation.UI.StarActor",
    aliases : ["CAAT.StarActor"],
    depends : [
        "CAAT.Foundation.ActorContainer"
    ],
    extendsClass : "CAAT.Foundation.ActorContainer",
    extendsWith : {

        /**
         * @lends CAAT.Foundation.UI.StarActor.prototype
         */

        __init : function() {
            this.__super();
            this.compositeOp= 'source-over';
            return this;
        },

        /**
         * Number of star peaks.
         */
        nPeaks:         0,

        /**
         * Maximum radius.
         */
        maxRadius:      0,

        /**
         * Minimum radius.
         */
        minRadius:      0,

        /**
         * Staring angle in radians.
         */
        initialAngle:   0,

        /**
         * Draw the star with this composite operation.
         */
        compositeOp:    null,

        /**
         *
         */
        lineWidth:      1,

        /**
         *
         */
        lineCap:        null,

        /**
         *
         */
        lineJoin:       null,

        /**
         *
         */
        miterLimit:     null,

        /**
         *
         * @param l {number>0}
         */
        setLineWidth : function(l)  {
            this.lineWidth= l;
            return this;
        },
        /**
         *
         * @param lc {string{butt|round|square}}
         */
        setLineCap : function(lc)   {
            this.lineCap= lc;
            return this;
        },
        /**
         *
         * @param lj {string{bevel|round|miter}}
         */
        setLineJoin : function(lj)  {
            this.lineJoin= lj;
            return this;
        },
        /**
         *
         * @param ml {integer>0}
         */
        setMiterLimit : function(ml)    {
            this.miterLimit= ml;
            return this;
        },
        getLineCap : function() {
            return this.lineCap;
        },
        getLineJoin : function()    {
            return this.lineJoin;
        },
        getMiterLimit : function()  {
            return this.miterLimit;
        },
        getLineWidth : function()   {
            return this.lineWidth;
        },
        /**
         * Sets whether the star will be color filled.
         * @param filled {boolean}
         * @deprecated
         */
        setFilled : function( filled ) {
            return this;
        },
        /**
         * Sets whether the star will be outlined.
         * @param outlined {boolean}
         * @deprecated
         */
        setOutlined : function( outlined ) {
            return this;
        },
        /**
         * Sets the composite operation to apply on shape drawing.
         * @param compositeOp an string with a valid canvas rendering context string describing compositeOps.
         * @return this
         */
        setCompositeOp : function(compositeOp){
            this.compositeOp= compositeOp;
            return this;
        },
        /**
         * 
         * @param angle {number} number in radians.
         */
        setInitialAngle : function(angle) {
            this.initialAngle= angle;
            return this;
        },
        /**
         * Initialize the star values.
         * <p>
         * The star actor will be of size 2*maxRadius.
         *
         * @param nPeaks {number} number of star points.
         * @param maxRadius {number} maximum star radius
         * @param minRadius {number} minimum star radius
         *
         * @return this
         */
        initialize : function(nPeaks, maxRadius, minRadius) {
            this.setSize( 2*maxRadius, 2*maxRadius );

            this.nPeaks= nPeaks;
            this.maxRadius= maxRadius;
            this.minRadius= minRadius;

            return this;
        },
        /**
         * Paint the star.
         *
         * @param director {CAAT.Director}
         * @param timer {number}
         */
        paint : function(director, timer) {

            var ctx=        director.ctx;
            var centerX=    this.width/2;
            var centerY=    this.height/2;
            var r1=         this.maxRadius;
            var r2=         this.minRadius;
            var ix=         centerX + r1*Math.cos(this.initialAngle);
            var iy=         centerY + r1*Math.sin(this.initialAngle);

            ctx.lineWidth= this.lineWidth;
            if ( this.lineCap ) {
                ctx.lineCap= this.lineCap;
            }
            if ( this.lineJoin )    {
                ctx.lineJoin= this.lineJoin;
            }
            if ( this.miterLimit )  {
                ctx.miterLimit= this.miterLimit;
            }

            ctx.globalCompositeOperation= this.compositeOp;

            ctx.beginPath();
            ctx.moveTo(ix,iy);

            for( var i=1; i<this.nPeaks*2; i++ )   {
                var angleStar= Math.PI/this.nPeaks * i + this.initialAngle;
               var rr= (i%2===0) ? r1 : r2;
                var x= centerX + rr*Math.cos(angleStar);
                var y= centerY + rr*Math.sin(angleStar);
                ctx.lineTo(x,y);
            }

            ctx.lineTo(
                centerX + r1*Math.cos(this.initialAngle),
                centerY + r1*Math.sin(this.initialAngle) );

            ctx.closePath();
            
            if ( this.fillStyle ) {
                ctx.fillStyle= this.fillStyle;
                ctx.fill();
            }

            if ( this.strokeStyle ) {
                ctx.strokeStyle= this.strokeStyle;
                ctx.stroke();
            }

        }
    }

});
CAAT.Module( {

    /**
     * @name TextActor
     * @memberOf CAAT.Foundation.UI
     * @extends CAAT.Foundation.Actor
     * @constructor
     */

    defines : "CAAT.Foundation.UI.TextActor",
    aliases : ["CAAT.TextActor"],
    extendsClass : "CAAT.Foundation.Actor",
    constants : {
        TRAVERSE_PATH_FORWARD: 1,
        TRAVERSE_PATH_BACKWARD: -1
    },
    depends : [
        "CAAT.Foundation.Actor",
        "CAAT.Foundation.SpriteImage",
        "CAAT.Module.Font.Font",
        "CAAT.Math.Point",
        "CAAT.Behavior.Interpolator"
    ],
    extendsWith : {

        /**
         * @lends CAAT.Foundation.UI.TextActor.prototype
         */

        __init : function() {
            this.__super();
            this.font= "10px sans-serif";
            this.textAlign= "left";
            this.outlineColor= "black";
            this.clip= false;
            this.__calcFontData();

            return this;
        },

        /**
         * a valid canvas rendering context font description. Default font will be "10px sans-serif".
         */
		font:			    null,

        /**
         * Font info. Calculated in CAAT.
         */
        fontData:           null,

        /**
         * a valid canvas rendering context textAlign string. Any of:
         *   start, end, left, right, center.
         * defaults to "left".
         */
		textAlign:		    null,

        /**
         * a valid canvas rendering context textBaseLine string. Any of:
         *   top, hanging, middle, alphabetic, ideographic, bottom.
         * defaults to "top".
         */
		textBaseline:	    "top",

        /**
         * a boolean indicating whether the text should be filled.
         */
		fill:			    true,

        /**
         * text fill color
         */
        textFillStyle   :   '#eee',

        /**
         * a string with the text to draw.
         */
		text:			    null,

        /**
         * calculated text width in pixels.
         */
		textWidth:		    0,

        /**
         * calculated text height in pixels.
         */
        textHeight:         0,

        /**
         * a boolean indicating whether the text should be outlined. not all browsers support it.
         */
		outline:		    false,

        /**
         * a valid color description string.
         */
		outlineColor:	    null,

        /**
         * text's stroke line width.
         */
        lineWidth:          1,

        /**
         * a CAAT.PathUtil.Path which will be traversed by the text.
         */
		path:			    null,

        /**
         * A CAAT.Behavior.Interpolator to apply to the path traversal.
         */
        pathInterpolator:	null,

        /**
         * time to be taken to traverse the path. ms.
         */
        pathDuration:       10000,

        /**
         * traverse the path forward (1) or backwards (-1).
         */
		sign:			    1,      //

        lx:                 0,
        ly:                 0,

        /**
         * Set the text to be filled. The default Filling style will be set by calling setFillStyle method.
         * Default value is true.
         * @param fill {boolean} a boolean indicating whether the text will be filled.
         * @return this;
         */
        setFill : function( fill ) {
            this.stopCacheAsBitmap();
            this.fill= fill;
            return this;
        },
        setLineWidth : function( lw ) {
            this.stopCacheAsBitmap();
            this.lineWidth= lw;
            return this;
        },
        setTextFillStyle : function( style ) {
            this.stopCacheAsBitmap();
            this.textFillStyle= style;
            return this;
        },
        /**
         * Sets whether the text will be outlined.
         * @param outline {boolean} a boolean indicating whether the text will be outlined.
         * @return this;
         */
        setOutline : function( outline ) {
            this.stopCacheAsBitmap();
            this.outline= outline;
            return this;
        },
        setPathTraverseDirection : function(direction) {
            this.sign= direction;
            return this;
        },
        /**
         * Defines text's outline color.
         *
         * @param color {string} sets a valid canvas context color.
         * @return this.
         */
        setOutlineColor : function( color ) {
            this.stopCacheAsBitmap();
            this.outlineColor= color;
            return this;
        },
        /**
         * Set the text to be shown by the actor.
         * @param sText a string with the text to be shwon.
         * @return this
         */
		setText : function( sText ) {
            this.stopCacheAsBitmap();
			this.text= sText;
            if ( null===this.text || this.text==="" ) {
                this.width= this.height= 0;
            }
            this.calcTextSize( CAAT.currentDirector );

            this.invalidate();

            return this;
        },
        setTextAlign : function( align ) {
            this.textAlign= align;
            this.__setLocation();
            return this;
        },
        /**
         * Sets text alignment
         * @param align
         * @deprecated use setTextAlign
         */
        setAlign : function( align ) {
            return this.setTextAlign(align);
        },
        /**
         * Set text baseline.
         * @param baseline
         */
        setTextBaseline : function( baseline ) {
            this.stopCacheAsBitmap();
            this.textBaseline= baseline;
            return this;

        },
        setBaseline : function( baseline ) {
            this.stopCacheAsBitmap();
            return this.setTextBaseline(baseline);
        },
        /**
         * Sets the font to be applied for the text.
         * @param font a string with a valid canvas rendering context font description.
         * @return this
         */
        setFont : function(font) {

            this.stopCacheAsBitmap();

            if ( !font ) {
                font= "10px sans-serif";
            }

            if ( font instanceof CAAT.Module.Font.Font ) {
                font.setAsSpriteImage();
            } else if (font instanceof CAAT.Foundation.SpriteImage ) {
                //CAAT.log("WARN: setFont will no more accept a CAAT.SpriteImage as argument.");
            }
            this.font= font;

            this.__calcFontData();
            this.calcTextSize( CAAT.director[0] );

            return this;
		},

        setLocation : function( x,y) {
            this.lx= x;
            this.ly= y;
            this.__setLocation();
            return this;
        },

        setPosition : function( x,y ) {
            this.lx= x;
            this.ly= y;
            this.__setLocation();
            return this;
        },

        setBounds : function( x,y,w,h ) {
            this.lx= x;
            this.ly= y;
            this.setSize(w,h);
            this.__setLocation();
            return this;
        },

        setSize : function( w, h ) {
            CAAT.Foundation.UI.TextActor.superclass.setSize.call(this,w,h);
            this.__setLocation();
            return this;
        },

        /**
         * @private
         */
        __setLocation : function() {

            var nx, ny;

            if ( this.textAlign==="center" ) {
                nx= this.lx - this.width/2;
            } else if ( this.textAlign==="right" || this.textAlign==="end" ) {
                nx= this.lx - this.width;
            } else {
                nx= this.lx;
            }

            if ( this.textBaseline==="bottom" ) {
                ny= this.ly - this.height;
            } else if ( this.textBaseline==="middle" ) {
                ny= this.ly - this.height/2;
            } else if ( this.textBaseline==="alphabetic" ) {
                ny= this.ly - this.fontData.ascent;
            } else {
                ny= this.ly;
            }

            CAAT.Foundation.UI.TextActor.superclass.setLocation.call( this, nx, ny );
        },

        centerAt : function(x,y) {
            this.textAlign="left";
            this.textBaseline="top";
            return CAAT.Foundation.UI.TextActor.superclass.centerAt.call( this, x, y );
        },

        /**
         * Calculates the text dimension in pixels and stores the values in textWidth and textHeight
         * attributes.
         * If Actor's width and height were not set, the Actor's dimension will be set to these values.
         * @param director a CAAT.Director instance.
         * @return this
         */
        calcTextSize : function(director) {

            if ( typeof this.text==='undefined' || null===this.text || ""===this.text ) {
                this.textWidth= 0;
                this.textHeight= 0;
                return this;
            }

            if ( director.glEnabled ) {
                return this;
            }

            if ( this.font instanceof CAAT.Foundation.SpriteImage ) {
                this.textWidth= this.font.stringWidth( this.text );
                this.textHeight=this.font.stringHeight();
                this.width= this.textWidth;
                this.height= this.textHeight;
                this.fontData= this.font.getFontData();
/*
                var as= (this.font.singleHeight *.8)>>0;
                this.fontData= {
                    height : this.font.singleHeight,
                    ascent : as,
                    descent: this.font.singleHeight - as
                };
*/
                return this;
            }

            if ( this.font instanceof CAAT.Module.Font.Font ) {
                this.textWidth= this.font.stringWidth( this.text );
                this.textHeight=this.font.stringHeight();
                this.width= this.textWidth;
                this.height= this.textHeight;
                this.fontData= this.font.getFontData();
                return this;
            }

            var ctx= director.ctx;

            ctx.save();
            ctx.font= this.font;

            this.textWidth= ctx.measureText( this.text ).width;
            if (this.width===0) {
                this.width= this.textWidth;
            }
/*
            var pos= this.font.indexOf("px");
            if (-1===pos) {
                pos= this.font.indexOf("pt");
            }
            if ( -1===pos ) {
                // no pt or px, so guess a size: 32. why not ?
                this.textHeight= 32;
            } else {
                var s =  this.font.substring(0, pos );
                this.textHeight= parseInt(s,10);
            }
*/

            this.textHeight= this.fontData.height;
            this.setSize( this.textWidth, this.textHeight );

            ctx.restore();

            return this;
        },

        __calcFontData : function() {
            this.fontData= CAAT.Module.Font.Font.getFontMetrics( this.font );
        },

        /**
         * Custom paint method for TextActor instances.
         * If the path attribute is set, the text will be drawn traversing the path.
         *
         * @param director a valid CAAT.Director instance.
         * @param time an integer with the Scene time the Actor is being drawn.
         */
		paint : function(director, time) {

            if (!this.text) {
                return;
            }

            CAAT.Foundation.UI.TextActor.superclass.paint.call(this, director, time );

            if ( this.cached ) {
                // cacheAsBitmap sets this actor's background image as a representation of itself.
                // So if after drawing the background it was cached, we're done.
                return;
            }

			if ( null===this.text) {
				return;
			}

            if ( this.textWidth===0 || this.textHeight===0 ) {
                this.calcTextSize(director);
            }

			var ctx= director.ctx;
			
			if ( this.font instanceof CAAT.Module.Font.Font || this.font instanceof CAAT.Foundation.SpriteImage ) {
				this.drawSpriteText(director,time);
                return;
			}

			if( null!==this.font ) {
				ctx.font= this.font;
			}

            /**
             * always draw text with middle or bottom, top is buggy in FF.
             * @type {String}
             */
            ctx.textBaseline="alphabetic";

			if (null===this.path) {

                if ( null!==this.textAlign ) {
                    ctx.textAlign= this.textAlign;
                }

                var tx=0;
                if ( this.textAlign==='center') {
                    tx= (this.width/2)|0;
                } else if ( this.textAlign==='right' ) {
                    tx= this.width;
                }

				if ( this.fill ) {
                    if ( null!==this.textFillStyle ) {
                        ctx.fillStyle= this.textFillStyle;
                    }
					ctx.fillText( this.text, tx, this.fontData.ascent  );
				}

                if ( this.outline ) {
                    if (null!==this.outlineColor ) {
                        ctx.strokeStyle= this.outlineColor;
                    }

                    ctx.lineWidth= this.lineWidth;
                    ctx.beginPath();
					ctx.strokeText( this.text, tx, this.fontData.ascent );
				}
			}
			else {
				this.drawOnPath(director,time);
			}
		},
        /**
         * Private.
         * Draw the text traversing a path.
         * @param director a valid CAAT.Director instance.
         * @param time an integer with the Scene time the Actor is being drawn.
         */
		drawOnPath : function(director, time) {

			var ctx= director.ctx;

            if ( this.fill && null!==this.textFillStyle ) {
                ctx.fillStyle= this.textFillStyle;
            }

            if ( this.outline && null!==this.outlineColor ) {
                ctx.strokeStyle= this.outlineColor;
            }

			var textWidth=this.sign * this.pathInterpolator.getPosition(
                    (time%this.pathDuration)/this.pathDuration ).y * this.path.getLength() ;
			var p0= new CAAT.Math.Point(0,0,0);
			var p1= new CAAT.Math.Point(0,0,0);

			for( var i=0; i<this.text.length; i++ ) {
				var caracter= this.text[i].toString();
				var charWidth= ctx.measureText( caracter ).width;

                // guonjien: remove "+charWidth/2" since it destroys the kerning. and he's right!!!. thanks.
				var currentCurveLength= textWidth;

				p0= this.path.getPositionFromLength(currentCurveLength).clone();
				p1= this.path.getPositionFromLength(currentCurveLength-0.1).clone();

				var angle= Math.atan2( p0.y-p1.y, p0.x-p1.x );

				ctx.save();

                    if ( CAAT.CLAMP ) {
					    ctx.translate( p0.x>>0, p0.y>>0 );
                    } else {
                        ctx.translate( p0.x, p0.y );
                    }
					ctx.rotate( angle );
                    if ( this.fill ) {
					    ctx.fillText(caracter,0,0);
                    }
                    if ( this.outline ) {
                        ctx.beginPath();
                        ctx.lineWidth= this.lineWidth;
                        ctx.strokeText(caracter,0,0);
                    }

				ctx.restore();

				textWidth+= charWidth;
			}
		},
		
		/**
         * Private.
         * Draw the text using a sprited font instead of a canvas font.
         * @param director a valid CAAT.Director instance.
         * @param time an integer with the Scene time the Actor is being drawn.
         */
		drawSpriteText: function(director, time) {
			if (null===this.path) {
				this.font.drawText( this.text, director.ctx, 0, 0);
			} else {
				this.drawSpriteTextOnPath(director, time);
			}
		},
		
		/**
         * Private.
         * Draw the text traversing a path using a sprited font.
         * @param director a valid CAAT.Director instance.
         * @param time an integer with the Scene time the Actor is being drawn.
         */
		drawSpriteTextOnPath: function(director, time) {
			var context= director.ctx;

			var textWidth=this.sign * this.pathInterpolator.getPosition(
                    (time%this.pathDuration)/this.pathDuration ).y * this.path.getLength() ;
			var p0= new CAAT.Math.Point(0,0,0);
			var p1= new CAAT.Math.Point(0,0,0);

			for( var i=0; i<this.text.length; i++ ) {
				var character= this.text[i].toString();
				var charWidth= this.font.stringWidth(character);

				//var pathLength= this.path.getLength();

				var currentCurveLength= charWidth/2 + textWidth;

				p0= this.path.getPositionFromLength(currentCurveLength).clone();
				p1= this.path.getPositionFromLength(currentCurveLength-0.1).clone();

				var angle= Math.atan2( p0.y-p1.y, p0.x-p1.x );

				context.save();

                if ( CAAT.CLAMP ) {
				    context.translate( p0.x|0, p0.y|0 );
                } else {
                    context.translate( p0.x, p0.y );
                }
				context.rotate( angle );
				
				var y = this.textBaseline === "bottom" ? 0 - this.font.getHeight() : 0;
				
				this.font.drawText(character, context, 0, y);

				context.restore();

				textWidth+= charWidth;
			}
		},
		
        /**
         * Set the path, interpolator and duration to draw the text on.
         * @param path a valid CAAT.Path instance.
         * @param interpolator a CAAT.Interpolator object. If not set, a Linear Interpolator will be used.
         * @param duration an integer indicating the time to take to traverse the path. Optional. 10000 ms
         * by default.
         */
		setPath : function( path, interpolator, duration ) {
			this.path= path;
            this.pathInterpolator= interpolator || new CAAT.Behavior.Interpolator().createLinearInterpolator();
            this.pathDuration= duration || 10000;

            /*
                parent could not be set by the time this method is called.
                so the actors bounds set is removed.
                the developer must ensure to call setbounds properly on actor.
             */
			this.mouseEnabled= false;

            return this;
		}
	}

});
CAAT.ModuleManager.solveAll();
