cmake_minimum_required(VERSION 2.8.3)
project(repbot_ros)

find_package(catkin REQUIRED)

catkin_package()

install(PROGRAMS
    src/base.js
    src/teleop_twist.js
    src/cmd_vel_mux.js
    DESTINATION ${CATKIN_PACKAGE_BIN_DESTINATION}
)