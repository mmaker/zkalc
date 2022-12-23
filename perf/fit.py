import math
import numpy as np
from numpy.polynomial import Polynomial as P
import matplotlib.pyplot as plt

# Benchmark data
# Here are the sizes of MSM we tried
xs =    [16    , 32    , 64    , 128  , 256    , 512   , 1024  , 2048    , 4096   , 8192   , 16384   , 32768   , 65536   , 131072   , 262144  , 524288]
# The time it took in milliseconds for the MSM in G1
ys_G1 = [1.2, 1.3,       2.0,    3.4,   5.7,     9.9,   17.2,   31.1,     56.4,    103.8,  191.17,   351.93,   647.36,   1220.0,    2283.2,   4183.1]
# The time it took in milliseconds for the MSM in G2
ys_G2 = [2.4, 3.7,       5.8,    9.7,  16.3,    28.1,    49.3,   99.8,    160.47,  294.33 , 543.27,  1000.4,   1820.7,   3476.1,    6463.4,   11806.0]

# Heuristic on how many ms it takes to do a G1 MSM of size `n`
def msm_G1_ms(n):
    microseconds = (150*n)/math.log(n,2)
    return microseconds / 1000

# Heuristic on how many ms it takes to do a G2 MSM of size `n`
def msm_G2_ms(n):
    microseconds = (420*n)/math.log(n,2)
    return microseconds / 1000

plt.plot(xs, ys_G1, label="G1 bench")
plt.plot(xs, ys_G2, label="G2 bench")

heuristic_G1_ys = []
heuristic_G2_ys = []
for x in xs:
    heuristic_G1_ys.append(msm_G1_ms(x))
    heuristic_G2_ys.append(msm_G2_ms(x))


plt.plot(xs, heuristic_G1_ys, label="G1 heuristic")
plt.plot(xs, heuristic_G2_ys, label="G2 heuristic")

plt.legend()
plt.show()
