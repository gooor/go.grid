module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    require('time-grunt')(grunt);
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'build/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        connect: {
            options: {
                port: 9000,
                hostname: 'localhost',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    middleware: function (connect, options) {
                        if (!Array.isArray(options.base)) {
                            options.base = [options.base];
                        }
                        var middlewares = [
                            require('grunt-connect-proxy/lib/utils').proxyRequest,
                            connect.static('.tmp'),
                            connect().use(
                                '/bower_components',
                                connect.static('./bower_components')
                            ),
                            connect.static(appConfig.app)
                        ];
                        var directory = options.directory || options.base[options.base.length - 1];
                        middlewares.push(connect.directory(directory));
                        return middlewares;
                    }
                }
            }
        },
        watch: {
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    'build/**/*.css',
                    'build/**/*.js',
                    'example/*'
                ]
            },
            sass: {
                files: ['src/**/*.sass', 'src/**/*.scss'],
                tasks: 'sass:build',
                spawn: false
            },
            coffee: {
                files: ['src/coffee/**/*.coffee'],
                tasks: ['coffee:build'],
                spawn: true
            },
            gruntfile: {
                files: ['Gruntfile.js']
            }
//
        },

        cssmin: {
            build: {
                src: 'build/go.grid.css',
                dest: 'build/go.grid.min.css'
            }
        },
        sass: {
            build: {
                options: {
                    compass: true,
                    lineNumbers: true
                },
                files: {
                    "build/go.grid.css": "src/sass/go.grid.sass"
                }
            },
        },
        coffee: {
            build: {
                files: {
                    "build/go.grid.js": [
                        'src/coffee/factories/*.coffee',
                        'src/coffee/controller.coffee',
                        'src/coffee/filters.coffee',
                        'src/coffee/templates.coffee',
                        'src/coffee/column.def.coffee',
                        'src/coffee/scroll.table.coffee',
                        'src/coffee/xls.exporter.coffee',
                        'src/coffee/go.grid.coffee',
                    ]
                }
            }
        },
    });
    grunt.registerTask('default', [
        'sass:build',
        'coffee:build',
        'watch'
    ]);

    grunt.registerTask('build', [
        'sass:build',
        'coffee:build',
        'uglify:build',
        'cssmin:build'
    ]);

    grunt.registerTask('css', ['sass']);

    grunt.loadNpmTasks('grunt-install-dependencies'); // auto installing dependencies
    grunt.loadNpmTasks('grunt-connect-proxy'); // proxy
    grunt.loadNpmTasks('grunt-shell-spawn'); // rails starting
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-autoprefixer');


};
