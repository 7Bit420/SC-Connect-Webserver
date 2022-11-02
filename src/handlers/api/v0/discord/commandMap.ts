import * as fs from 'fs';

var commands = new Map(fs.readdirSync(__dirname + '/commands')
    .map(t => require(__dirname + '/commands/' + t))
    .filter((t) => t.type == 'COMMAND')
    .map(t => [t.id, t]))

export { commands }

export const special = true,
    handle = 'DISCORD/COMMANDMAP';

