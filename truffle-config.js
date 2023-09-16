module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Localhost (default: Ganache)
      port: 7545, // Default Ganache port
      network_id: "5777", // Any network (default: *) 
    },
  },
  compilers: {
    solc: {
      version: "0.8.0", // Specify your desired Solidity compiler version here
      settings: {
        optimizer: {
          enabled: true,
          runs: 200, // Adjust the number of runs as needed
        },
      },
    },
  },
};
