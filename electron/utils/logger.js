const chalk = require("chalk");
const { logger } = require("webslider-sdk/lib/utils/logger/logger");

const trace = (...args) => logger.electron.trace(...args);
const debug = (...args) => logger.electron.debug(...args);
const notice = (...args) => logger.electron.notice(chalk.blue(...args));
const info = (...args) => logger.electron.info(chalk.green(...args));
const warn = (...args) => logger.electron.warn(chalk.yellow(...args));
const error = (...args) => logger.electron.error(chalk.red(...args));
const fatal = (...args) => logger.electron.fatal(chalk.magenta(...args));
const log = (...args) => logger.electron.log(...args);
const addLog = (...args) => logger.electron.add(...args);
const flushLogs = (...args) => logger.electron.flush(...args);

const domain = "app";
log(`Logger usage for ${domain.toUpperCase()} >>>`);
trace(`logger.${domain}.trace(...)`);
debug(`logger.${domain}.debug(...)`);
notice(`logger.${domain}.notice(...)`);
info(`logger.${domain}.info(...)`);
warn(`logger.${domain}.warn(...)`);
error(`logger.${domain}.error(...)`);
fatal(`logger.${domain}.fatal(...)`);
log(`logger.${domain}.log(...)`);
addLog(`logger.${domain}.add(...);`);
addLog(`logger.${domain}.flush();`);
flushLogs();
log(`Logger usage for ${domain.toUpperCase()} <<<`);

module.exports = {
  trace,
  debug,
  notice,
  info,
  warn,
  error,
  fatal,
  log,
  addLog,
  flushLogs,
};
