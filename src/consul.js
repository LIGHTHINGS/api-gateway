import consul from "consul";

const host = '127.0.0.1'
const consulClient = new consul({ host: host ?? "0.0.0.0", 
    port: 8500,
    promisify: true
});

// Service resolver using Consul

 export async function resolveService(serviceName) {
  return new Promise((resolve, reject) => {
    consulClient.catalog.service.nodes(serviceName).then((result) => {
        if (result.length === 0) {
            return reject(new Error(`Service ${serviceName} not found in Consul`));
        }
        // Pick one instance randomly (simple load balancing)
        const instance = result[Math.floor(Math.random() * result.length)];
        resolve(`http://${instance.Address}:${instance.ServicePort}`);
    }).catch((err) => {
        reject(err);
    });
    // consulClient.catalog.service.nodes(serviceName, (err, result) => {
    //   if (err) {
    //     console.log('Here3')
    //     return reject(err)
    // };

    //   if (result.length === 0) {
    //     console.log('Here2')
    //     return reject(new Error(`Service ${serviceName} not found in Consul`));
    //   }

    //   // Pick one instance randomly (simple load balancing)
    //   const instance = result[Math.floor(Math.random() * result.length)];
    //   resolve(`http://${instance.Address}:${instance.ServicePort}`);
    // });
  });
}

export  const registerService = async (serviceName, serviceId, port, address) => {
  return new Promise((resolve, reject) => {
    consulClient.agent.service.register(
        {
            name: serviceName,
            id: serviceId,
            address: address,
            port: port,
            check: {
                http: `http://${address}:${port}/health`,
                interval: '10s',
                timeout: '5s'
            }
        }
    ).then((result) => {
      console.log(result)
      resolve(result)
    }).catch((err) => {
      console.log(err);
      reject(err)
    })
  });
}

export const deregisterService = async (serviceId) => {
  return new Promise((resolve, reject) => {
    consulClient.agent.service.deregister(serviceId, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export const listServices = async () => {
  return new Promise((resolve, reject) => {
    consulClient.agent.service.list().then((result) => {
      resolve(result);
    }).catch((err) => {
      reject(err);

  })
});
}
// Health check for Consul connection
export const updateService = async (serviceName, serviceId, newPort) => {
  return new Promise((resolve, reject) => {
    consulClient.agent.service.update(  
      {
        name: serviceName,
        id: serviceId,
        port: newPort
      }, (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}
async function checkConsulConnection() {
  try {
    // Try to fetch the agent’s self info
    const info = await consulClient.agent.self();
    console.log("✅ Connected to Consul");
    console.log("Node name:", info.Config.NodeName);
    console.log("Datacenter:", info.Config.Datacenter);
  } catch (err) {
    console.error("❌ Failed to connect to Consul:", err.message);
    process.exit(1); // optional: crash app if no Consul
  }
}

checkConsulConnection();