module.exports = function(grunt) {
    grunt.initConfig({
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [
                    'libs/jquery/jquery-1.11.3.min.js',
                    'libs/jquery/jquery-ui.min.js',
                    'libs/bootstrap/js/bootstrap.min.js',
                    'libs/bootstrap/date-picker/bootstrap-datepicker.js',
                    'libs/fullcalendar/moment.min.js',
                    'libs/fullcalendar/fullcalendar.min.js',
                    'libs/fullcalendar/lang/ru.js',
                    'libs/canvas/canvasjs.min.js',
                    'libs/tab-slide/jquery.tabslideout.v1.3.js',
                    'libs/jstree/jstree.min.js',
                    'libs/col-resize/colResizable-1.6.min.js'
                ],
                dest: 'dist/js/libs.js'
            },
            css:{
                src: [
                    'libs/bootstrap/css/bootstrap.min.css',
                    'libs/bootstrap/date-picker/bootstrap-datepicker.min.css',
                    'libs/fullcalendar/fullcalendar.min.css',
                    'libs/bootstrap/date-picker/bootstrap-datepicker.min.css'
                ],
                dest: 'dist/css/libs.css'
            }
        },
        sass: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    'dist/css/main.css': 'app/styles/style.sass'
                }
            }
        },
        compress: {
            main: {
                options: {
                    mode: 'gzip'
                },
                expand: true,
                cwd: 'assets/',
                src: ['**/*'],
                dest: 'public/'
            }
        }
    });
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.registerTask('default', ['sass']);
    grunt.registerTask('cat', ['concat']);
};
