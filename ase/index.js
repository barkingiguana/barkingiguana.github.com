function onLoad() {
  var rootElement = document.getElementById("calculator")
  var model = {
    initialize: function () {
      this.apiCount = 25
      this.instancesPerApi = 2
      this.ramPerApi = 2048
      this.cpuPerApi = 0.75
      this.workersPerAse = 100
      this.aseHourlyBaseCost = 1.822 // AUD in Australia East https://azure.microsoft.com/en-gb/pricing/details/app-service/
      this.instanceCostPerHour = 1.6
      this.hoursPerMonth = 731
    },
    update: function () {
      this.workerPairs = Math.floor(this.workersPerAse / this.instancesPerApi)
      for(let size = 1; size <= 3; size++) {
        let key = "i" + size.toString()
        this[key + "InstanceRam"] = this.instanceRam(size)
        this[key + "InstanceCpu"] = this.instanceCpu(size)
        this[key + "InstanceApis"] = Math.min(
          Math.floor(this[key + "InstanceRam"] / this.ramPerApi),
          Math.floor(this[key + "InstanceCpu"] / this.cpuPerApi),
        )
        this[key + "AseApis"] = this.workerPairs * this[key + "InstanceApis"]
        this[key + "AseRequiredPerEnvironment"] = Math.ceil(this.apiCount / this[key + "AseApis"])
        this[key + "AseRequired"] = 4 * this[key + "AseRequiredPerEnvironment"]
        this[key + "AseMonthlyBaseCost"] = this.cost(this[key + "AseRequired"] * this.hoursPerMonth * this.aseHourlyBaseCost)
        this[key + "BackendRequired"] = Math.ceil(this.apiCount / this[key + "InstanceApis"])
        this[key + "FrontendRequired"] = Math.ceil(this[key + "BackendRequired"] / 15)
        this[key + "BillableInstances"] = (this[key + "FrontendRequired"] - 1) + this[key + "BackendRequired"]
        this[key + "InstanceCostPerHour"] = this.instanceCost(size)
        this[key + "InstanceCostPerMonth"] = this.cost(this[key + "InstanceCostPerHour"] * this[key + "BillableInstances"] * this.hoursPerMonth)
        this[key + "TotalCostPerMonth"] = this.cost(this[key + "AseMonthlyBaseCost"] + this[key + "InstanceCostPerMonth"])
        this[key + "ApiCostPerMonth"] = this.cost(this[key + "TotalCostPerMonth"] / this.apiCount)
      }
    },
    cost: function(c) {
      return Math.ceil(c * 1000) / 1000
    },
    instanceCost: function (size) {
      // https://azure.microsoft.com/en-gb/pricing/details/app-service/ - prices for Isolated in Australia East
      return [ 0.637, 1.274, 2.548 ][size - 1]
    },
    instanceRam: function (size) {
      return [ 3.5, 7, 14 ][size - 1] * 1024
    },
    instanceCpu: function (size) {
      return [ 1, 2, 4 ][size - 1]
    }
  }
  new Tangle(rootElement, model)
}
