module.exports = function(grunt){

    "use strict";
   require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        srcPath:            "src/",
        buildPath:          "build/",

        jsSrcPath:          "<%= srcPath %>js/",
        jsBuildPath:        "<%= buildPath %>js/",

        corePath:           "<%= jsSrcPath %>core/",
        webglPath:          "<%= jsSrcPath %>webgl/",

        fluidsPath:         "<%= webglPath %>fluids/",
        displacementPath:   "<%= webglPath %>displacementshader/",
        semPath:            "<%= webglPath %>sphericalenvmapping/",
        shaderLibPath:      "<%= webglPath %>shaderlib/",

        pkg: grunt.file.readJSON("package.json"),

        cssc: {
            build: {
                options: {
                    consolidateViaDeclarations: true,
                    consolidateViaSelectors:    true,
                    consolidateMediaQueries:    true
                },
                files: {
                    "build/css/master.css": "build/css/master.css"
                }
            }
        },

        cssmin: {
            build: {
                src: "build/css/master.css",
                dest: "build/css/master.css"
            }
        },

        sass: {
            build: {
                files: {
                    "build/css/master.css": "assets/sass/master.scss"
                }
            }
        },

        watch: {
            html: {
                files: ["index.html"],
                tasks: ["htmlhint"]
            },
            js: {
                files: ["src/js/**/*.js"],
                tasks: ["concat:dev"]
            },
            css: {
                files: ["assets/sass/**/*.scss"],
                tasks: ["buildcss"]
            },
            glsl: {
                files: ["<%= fluidsPath %>shaders/*.vert", "<%= fluidsPath %>shaders/*.frag", "<%= semPath %>shaders/*.vert", "<%= semPath %>shaders/*.frag"],
                tasks: ["glsl_threejs", "concat", "uglify"]
            }
        },

        htmlhint: {
            build: {
                options: {
                    "tag-pair": true,
// Force tags to have a closing pair
                    "tagname-lowercase": true,
// Force tags to be lowercase
                    "attr-lowercase": true,
// Force attribute names to be lowercase e.g. <div id="header"> is invalid
                    "attr-value-double-quotes": true,
// Force attributes to have double quotes rather than single
                    "doctype-first": true,
// Force the DOCTYPE declaration to come first in the document
                    "spec-char-escape": true,
// Force special characters to be escaped
                    "id-unique": true,
// Prevent using the same ID multiple times in a document
                    "head-script-disabled": true,
// Prevent script tags being loaded in the  for performance reasons
                    "style-disabled": true
// Prevent style tags. CSS should be loaded through 
                },
                src: ["index.html"]
            }
        },

        uglify: {
            build: {
                options: {
                    banner: "/* D I O N Y S I U S  M A R Q U I S */\n"
                },
                files: {
                    "<%= jsBuildPath %>dionysiusmarquis.core.min.js": ["<%= jsBuildPath %>dionysiusmarquis.core.js"],
                    "<%= jsBuildPath %>dionysiusmarquis.fluids.min.js": ["<%= jsBuildPath %>dionysiusmarquis.fluids.js"],
                    "<%= jsBuildPath %>dionysiusmarquis.shaderlib.min.js": ["<%= jsBuildPath %>dionysiusmarquis.shaderlib.js"],
                    "<%= jsBuildPath %>dionysiusmarquis.sem.min.js": ["<%= jsBuildPath %>dionysiusmarquis.sem.js"],
                    "<%= jsBuildPath %>dionysiusmarquis.displacement.min.js": ["<%= jsBuildPath %>dionysiusmarquis.displacement.js"],
                }
            }
        },

        glsl_threejs: {
            buildfluids: {
                options: {
                    jsPackage: "dm.Fluids.Shaders"
                },
                files: {
                    "<%= fluidsPath %>core/shaders.js": ["<%= fluidsPath %>shaders/*.vert", "<%= fluidsPath %>shaders/*.frag"]
                }
            },

            buildsem: {
                options: {
                    jsPackage: "dm.ShaderLib"
                },
                files: {
                    "<%= semPath %>shaders.js": ["<%= semPath %>shaders/*.vert", "<%= semPath %>shaders/*.frag"]
                }
            },

            buildlib: {
                options: {
                    jsPackage: "dm.ShaderLib"
                },
                files: {
                    "<%= shaderLibPath %>shaders.js": ["<%= shaderLibPath %>shaders/*.vert", "<%= shaderLibPath %>shaders/*.frag"]
                }
            },

            builddisplacement: {
                options: {
                    jsPackage: "dm.ShaderLib"
                },
                files: {
                    "<%= displacementPath %>shader.js": ["<%= displacementPath %>shader/*.vert", "<%= displacementPath %>shader/*.frag"]
                }
            },
        },

        concat: {
            header: {
                options: {
                    separator: "\n\n",
                },
                files: {
                    "<%= fluidsPath %>core/shaders.js": ["<%= fluidsPath %>shaders/header", "<%= fluidsPath %>core/shaders.js"],
                    "<%= semPath %>shaders.js": ["<%= semPath %>shaders/header", "<%= semPath %>shaders.js"],
                    "<%= shaderLibPath %>shaders.js": ["<%= shaderLibPath %>shaders/header", "<%= shaderLibPath %>shaders.js"],
                    "<%= displacementPath %>shader.js": ["<%= displacementPath %>shader/header", "<%= displacementPath %>shader.js"]
                }
            },

            build: {
                options: {
                    separator: "\n\n",
                },
                files: {
                    "<%= jsBuildPath %>dionysiusmarquis.core.js": ["<%= corePath %>EventTarget.js", "<%= corePath %>HTMLElement.js", "<%= corePath %>Utils.js", "<%= corePath %>HTMLCanvasElement.js"],
                    "<%= jsBuildPath %>dionysiusmarquis.fluids.js": ["<%= fluidsPath %>**/*.js"],
                    "<%= jsBuildPath %>dionysiusmarquis.shaderlib.js": ["<%= shaderLibPath %>*.js"],
                    "<%= jsBuildPath %>dionysiusmarquis.sem.js": ["<%= semPath %>*.js"],
                    "<%= jsBuildPath %>dionysiusmarquis.displacement.js": ["<%= displacementPath %>*.js"],
                }
            }
        },

        replace: {
          example: {
            src: ["<%= webglPath %>**/shaders.js"],
            overwrite: true,
            replacements: [{
              from: "\"fv\"",
              to: "\"fv1\""
            }]
          }
        }

    });

    grunt.registerTask("default",   ["watch"]);
    grunt.registerTask("build",     ["glsl_threejs", "replace", "concat", "uglify"]);
    grunt.registerTask("build-dev",     ["concat:dev"]);
    grunt.registerTask("buildcss",  ["sass", "cssc", "cssmin"]);

};