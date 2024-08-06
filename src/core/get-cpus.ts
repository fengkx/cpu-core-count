export interface FileSystem {
  readFile(path: string): Promise<string>;
  fileExists(path: string): Promise<boolean>;
}

export interface SystemInfo {
  getSystemCPUs(): number;
}

type GetAvailableCPUsFactory = (
  fs: FileSystem,
  systemInfo: SystemInfo
) => () => Promise<number>;

export const createGetAvailableCPUs: GetAvailableCPUsFactory = (fs, systemInfo) => {
  const CGROUP_V2_CONTROLLERS = '/sys/fs/cgroup/cgroup.controllers';
  const CGROUP_V2_CPU_MAX = '/sys/fs/cgroup/cpu.max';
  const CGROUP_V1_QUOTA = '/sys/fs/cgroup/cpu/cpu.cfs_quota_us';
  const CGROUP_V1_PERIOD = '/sys/fs/cgroup/cpu/cpu.cfs_period_us';

  async function getCgroupCPUs(): Promise<number | null> {
    if (await fs.fileExists(CGROUP_V2_CONTROLLERS)) {
      return getCgroupV2CPUs();
    }
    return getCgroupV1CPUs();
  }

  async function getCgroupV2CPUs(): Promise<number | null> {
    if (await fs.fileExists(CGROUP_V2_CPU_MAX)) {
      const cpuMax = await fs.readFile(CGROUP_V2_CPU_MAX);
      const [quota, period] = cpuMax.trim().split(' ');
      
      if (quota !== 'max') {
        return calculateCPUs(parseInt(quota), parseInt(period));
      }
    }
    return null;
  }

  async function getCgroupV1CPUs(): Promise<number | null> {
    if (await fs.fileExists(CGROUP_V1_QUOTA) && await fs.fileExists(CGROUP_V1_PERIOD)) {
      const quota = parseInt(await fs.readFile(CGROUP_V1_QUOTA));
      const period = parseInt(await fs.readFile(CGROUP_V1_PERIOD));
      
      if (quota !== -1) {
        return calculateCPUs(quota, period);
      }
    }
    return null;
  }

  function calculateCPUs(quota: number, period: number): number {
    return Math.max(Math.floor(quota / period), 1);
  }

  return async function getAvailableCPUs(): Promise<number> {
    try {
      const cgroupCPUs = await getCgroupCPUs();
      if (cgroupCPUs !== null) {
        return cgroupCPUs;
      }
    } catch (error) {
      console.error('Error reading cgroup information:', (error as Error).message);
    }

    return systemInfo.getSystemCPUs();
  };
};


