Literature for course project variant 6:

Priority (if short on time):
[]: Baran, On Distributed Communications (the algorithm)
[]: Bertsekas & Gallager, Data Networks, ch. 2-3 (packet size, ARQ, queueing)
[]: Law, Simulation Modeling and Analysis, output analysis chapter

Routing theory:
[]: Course guide (Орлова, Щербина), sections 4.2-4.11: terminology used by the prof
[]: Олифер В.Г., Олифер Н.А. Компьютерные сети, routing chapter: local / distributed / centralized / hybrid adaptive routing classification (variant name comes from here)
[]: Baran P. On Distributed Communications, RAND, 1964, vol. I and VIII: original hot potato + backward learning (free on rand.org)
[]: Tanenbaum A. Computer Networks, ch. 5: flooding, routing basics, VC vs datagram (5.1); 3rd edition still covers isolated (local) routing

Transmission, errors, packet size:
[]: Bertsekas D., Gallager R. Data Networks
    - ch. 2: ARQ (stop-and-wait, go-back-N), optimal packet length (overhead vs errors)
    - ch. 3: delay models, queueing, M/M/1 (Task 5 + validation tests)
[]: Kurose J., Ross K. Computer Networking, ch. 3: reliable data transfer, RTT estimation
[]: RFC 6298: retransmission timeout computation from measured RTT (Jacobson/Karels)

Simulation methodology:
[]: Law A. Simulation Modeling and Analysis
    - discrete-event simulation structure (event list, clock)
    - random number generation, sampling from distributions
    - output analysis: multiple seeds, warm-up period, confidence intervals (plot mean + error bars, not single runs)
[]: O'Neill M. PCG paper or Vigna S. xoshiro page: pick a PRNG, implement it (~20 lines)

Optional:
[]: OMNeT++ manual, architecture chapters: engine / model / trace separation, reference design
