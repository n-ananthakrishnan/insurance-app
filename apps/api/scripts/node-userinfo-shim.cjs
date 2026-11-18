// Node 24 may fail uv_os_get_passwd in restricted Windows environments.
// tsx only needs these values to choose a temporary directory.
const os = require("node:os");
const preload = `--require="${__filename.replace(/\\/g, "/")}"`;
if (!process.env.NODE_OPTIONS?.includes(__filename)) {
  process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ""} ${preload}`.trim();
}
try {
  os.userInfo = () => ({
    uid: -1,
    gid: -1,
    username: process.env.USERNAME || "developer",
    homedir: process.env.USERPROFILE || process.cwd(),
    shell: null,
  });
} catch {
  // Keep the normal Node implementation if the property cannot be replaced.
}
