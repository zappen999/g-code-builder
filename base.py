class Program:
    def __init__(self):
        self._blocks = []
        self._current_block = None

    def digest(self, raw_line):
        if self._current_block:
            if self._is_start_of_block(raw_line) or self._is_end_of_block(raw_line):
                self._rotate_block('new')

        if not self._current_block:
            self._ensure_block()

        self._current_block.add(raw_line)

    def end(self):
        self._rotate_block('end')

    def _rotate_block(self, name):
        self._blocks.append(self._current_block)
        self._current_block = Block(name)

    def _ensure_block(self):
        if not self._current_block:
            self._current_block = Block('Setup')

    def _is_start_of_block(self, line):
        return line.startswith('(Begin operation')

    def _is_end_of_block(self, line):
        return line.startswith('(Finish operation')

    def repeat_block(self, index):
        pass

    def to_string(self):
        result = ''

        for block in self._blocks:
            result += '(Block: %s)\n' % block.name
            result += '%s\n' % block.to_string()

        return result


# A pattern should fit inside a block
class Block:
    def __init__(self, name):
        self.name = name
        self._cmds = []

    def add(self, line):
        if line.startswith('('):
            return

        cmd = Command(line.strip())
        self._cmds.append(cmd)

    def scale(self, factor):
        for cmd in self._cmds:
            cmd.scale(factor)

    def to_string(self):
        return '\n'.join([x.to_string() for x in self._cmds])


class Command:
    def __init__(self, cmd_str):
        self._cmd = None
        self._args = []
        self._parse(cmd_str)

    def _parse(self, cmd_str):
        instr = cmd_str.split()
        self._cmd = instr[0]

        for arg_str in instr[1:]:
            arg = Arg(arg_str)
            self._args.append(arg)

    def scale(self, factor):
        for arg in self._args:
            arg.scale(factor)

    def to_string(self):
        return '%s %s' % (self._cmd, ' '.join([x.to_string() for x in self._args]))

    def offset(x, y):
        pass


class Arg:
    def __init__(self, arg):
        self._name = None
        self._type = None
        self._value = None
        self._parse(arg)

    def _parse(self, arg_str):
        self._name = arg_str[0]
        self._type = 'float' if self._is_scalable() else 'str'
        self._value = float(arg_str[1:]) if self._type == 'float' else arg_str[1:]

    def _is_scalable(self):
        return self._name in ['X', 'Y', 'I', 'J', 'K']

    def scale(self, factor):
        if not self._is_scalable():
            return

        self._value = self._value * factor

    def to_string(self):
        if self._type == 'str':
            return '%s%s' % (self._name, self._value)
        elif self._type == 'float':
            return '%s%.3f' % (self._name, self._value)


########################################

pattern = {
    'width': 100.0,
    'height': 50.0,
}

front = {
    'width': 597.0,
    'height': 381.0,
}

copies = {
    'x': 6,
    'y': 3,
}

opts = {
    'mode': 'fill',  # contain, cover
    # 'align': 'top_left'
}

#######################################

program = Program()

with open('pattern-test.nc') as gcode:
    for line in gcode:
        program.digest(line)

    program.end()

program._blocks[5].scale(0)

print(program.to_string())
