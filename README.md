# GCode Builder

> Programming interface to build gcode, and make it possible to use
> scripting to dynamically generate tool paths.

## Limitations

CNC only.

## Ideas

- Different levels of abstraction when building G-code.
    - G-code level should be available.
    - Geometry helpers should be available (blocks).
        - Circles.
        - Rectangles.
        - Zig zag.
        - Planing.
    - Block editing tasks should be available.
        - Holding tabs.
        - Stepdown.
- Optimizers in each level.
    - Optimize program by calculating the least amount of traveling.
- Decorator pattern for decorating a Program, or decorating a Block?
    - Decorating a block with holding tabs?
    - Decorating a Program with a machining step?
        - Cutout.
        - Engraving.
        - Drilling.
        - Planing.
- Should not be able to add a block to a block, just blocks to a
  program.
- Command -> Block -> Program -> Job.
    - Purpose of each?
        - Command - Obvious - Primitive - Lib
        - Block - Group of Commands - Primitive - Lib
        - Program - Collection of blocks - Primitive, extendable - Lib
        - #### Not part of lib below ####
        - Job - Extended Program w. parameters/conditional block
          construction.
- No need for tool change if the correct tool is already loaded.
    - Virtual machine?
- Add operator hints and help in jobs.
    - Description of the job.
        - Where is the origin? Orientation etc.
