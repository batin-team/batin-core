const { execSync } = require("child_process");

const ports = [3000, 6969];

function killPorts(portsList) {
  try {
    if (process.platform === "win32") {
      let output = "";
      try {
        output = execSync(`netstat -ano`).toString();
      } catch (e) {
        return;
      }
      
      const lines = output.split("\n");
      const pids = new Set();
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 4) {
          const localAddress = parts[1];
          if (localAddress) {
            const match = portsList.some(port => localAddress.endsWith(`:${port}`) || localAddress.endsWith(`[::]:${port}`));
            if (match) {
              const pid = parts[parts.length - 1];
              if (pid && pid !== "0" && !isNaN(pid)) {
                pids.add(pid);
              }
            }
          }
        }
      }
      
      for (const pid of pids) {
        try {
          console.log(`Killing process ${pid}...`);
          execSync(`taskkill /F /PID ${pid}`);
        } catch (e) {
          // Ignore errors during killing
        }
      }
    } else {
      // Unix/macOS
      for (const port of portsList) {
        try {
          const pid = execSync(`lsof -t -i:${port}`).toString().trim();
          if (pid) {
            console.log(`Killing process ${pid} on port ${port}...`);
            execSync(`kill -9 ${pid}`);
          }
        } catch (e) {
          // Ignore if no process matches
        }
      }
    }
  } catch (e) {
    // Ignore overall errors
  }
}

console.log("Cleaning up ports 3000 and 6969...");
killPorts(ports);
console.log("Ports cleanup complete.");
