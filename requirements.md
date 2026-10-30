Course project variant 6 checklist:

Model:
[]: TypeScript simulation core, shared by the web UI (runs in a Web Worker) and the Node CLI
[]: own seeded PRNG + sampling (no Math.random) for deterministic runs
[]: model/scenario types defined once, shared by core, UI and JSON validation
[]: Types of nodes: router, workstation
[]: workstations attached to every k-th router, k in {2, 3, 4}; workstations are the message endpoints
[]: workstation-router links have their own params (ground type, weight, bandwidth, p_bit)
[]: Types of connections: ground, satellite (satellite = higher latency + error probability, used between regional networks)
[]: routers are located at 2D plane coordinates (used for layout and "most distant workstations")
[x]: nodes can be connected into regional networks
[]: routing algo is the same for all networks
[x]: connections between nodes have a weight, that has to be configured during model creation
[]: weight = routing cost only (input for Dijkstra etc.); timing comes from separate per-link params (bandwidth, propagation delay)
[]: weight must be monotonic with latency for a reference packet size: smaller weight => smaller latency (generator must keep this, e.g. satellite links get weights from the high end of the set)
[]: per-link attributes: type (ground/satellite), duplex | half-duplex, weight, p_bit (per-bit error probability), buffer size
[]: weight generation policy: random in range | constant from set
[]: nodes have IPv4 addresses as labels only (no aggregation/subnetting logic)
[x]: messages can be of varying length
[]: buffers are per outgoing link (output queues, needed for a*queue_len); size configurable per node (default for its links) with per-link override
[]: buffer size generation policy: random in range | constant from set
[]: buffer overflow: packet dropped, counted as lost

Topology generator:
[]: random generation with configurable policies (weights, buffers, half-duplex share, p_bit)
[]: variant 6 preset: 3 regional networks x >= 9 routers, average degree 3.5
[x]: weights from set {3, 5, 7, 8, 11, 12, 15, 18, 21, 25}
[]: links between regional networks are satellite links
[x]: generated graph must be connected

Time & traffic model (all params configurable in UI + scenario config, with defaults; values saved in the simulation record):
[]: per-hop delay: t_hop = (header + payload)/bandwidth + propagation + queueing + processing
[]: half-duplex links: one direction at a time, other side waits in queue
[]: bandwidth derived from weight (e.g. bandwidth = K/weight) to keep weight monotonic with latency; propagation per link type (ground ~ms, satellite ~250 ms)
[]: packet formats (bytes): data header, ACK, NACK, VC setup/confirm/teardown; payload size sweep range (e.g. 64 B .. 4 KB)
[]: control packets (ACK, setup, flood copies...) occupy links and queues like data packets
[]: error model: per-bit error prob -> P_packet = 1 - (1 - p_bit)^bits (default) | flat per-packet prob
[]: ACK policy: hop-by-hop | end-to-end (selectable per transmission mode)
[]: retransmission timeout: fixed initial value, then adapted from measured RTT (avoid spurious retx on satellite hops) | fixed value
[]: retry limit, after which the message is counted as failed
[]: processing delay per node (constant)

Transmission modes:
[]: virtual circuit: setup (request/confirm) -> data over fixed path -> teardown
[]: VC state: per-node circuit table (VC id -> outgoing line), created on setup, removed on teardown/timeout
[]: VC setup uses learned forwarding if destination is known, bootstrap method otherwise
[]: VC broken by disabled node/link: circuit torn down, source re-runs setup (re-setup counted as control traffic)
[]: datagram: each packet routed independently, may arrive out of order
[]: message fragmentation into packets of configurable size (packet size independent of message size)
[]: reassembly at destination (incl. out-of-order arrival in datagram mode)

Routing (local adaptive = backward learning):
[]: nodes never exchange routing info; they learn only from packets passing through
[x]: packets carry source, accumulated cost and hop count
[]: on receiving a packet from S on line X: record "S reachable via X at cost c / h hops" (learning in reverse direction, assumes symmetric links)
[]: table destinations = workstations (only traffic sources get learned; Task 2 tables are routes to workstations)
[]: per node table: destination -> per outgoing line latest learned cost + hop count + timestamp (gives both Task 2 tables: by weight and by hops)
[]: forwarding: pick line minimizing learned_cost + a*queue_len (a configurable; a = 0 => pure cost)
[]: bootstrap for unknown destinations, configurable per simulation (UI + scenario config):
    - flooding (default): TTL ~ network diameter + duplicate suppression via (source, seq) table; duplicates are learned from first, then dropped
    - random walk: TTL
    - hot potato (shortest queue): TTL
[]: datagram mode: bootstrap only while destination is unknown, then learned forwarding
[]: bootstrap copies (flood duplicates etc.) are counted as control traffic
[x]: loop protection: TTL + don't send back on the incoming line
[]: table entry aging: entries expire after configurable time, so failures/congestion get unlearned
[]: reference: offline Dijkstra (by weight) + BFS (by hops) for comparison only, not used for forwarding
[]: metric: fraction of table entries matching the reference vs number of messages passed (convergence)

Simulation:
[]: Discrete Event Simulation DES 
[x]: simulate communication between nodes
[]: simulate routing with local adaptive routing (backward learning, see Routing section)
[]: traffic: random traffic generator: arrival process (e.g. Poisson with rate lambda), message size distribution, src/dst selection (e.g. uniform over workstation pairs)
[]: traffic: manual "send N bytes from workstation A to B" (UI + scenario events)
[]: enable/disable nodes and links at runtime (UI or scheduled scenario events); disabled element drops its buffered packets (counted as lost)
[]: produces a simulation record that can be deterministically replayed/rerun
[]: record = config + seed + event trace (packet hops, queue changes, table updates, toggles); same trace feeds UI playback and Python plots
[]: trace verbosity: full (UI, playback) | metrics only (CLI sweeps, large runs)
[]: (Task 5, bonus) sweep mean request intensity of end nodes to find the max intensity at which waiting time stays <= T
    - waiting time = message request -> transmission start at source (T configurable)

Metrics:
[]: control vs data packets: counts and bytes (per message, per run)
[]: delivery time per message
[]: delay between the most geographically distant workstations
[]: lost / retransmitted packets, failed messages
[]: link utilisation and queue lengths over time (also feeds heatmap)

Validation:
[]: single link: measured delay == t_hop formula
[]: single link under Poisson load: waiting time matches M/M/1 theory
[]: conservation: sent == delivered + lost + in flight
[]: learned tables converge to Dijkstra/BFS reference on idle network with enough traffic

Model & scenario files:
[]: model (topology + params) stored as JSON; UI loads/saves it (round-trip)
[]: scenario (model ref + seed + traffic + scheduled events + sim params) stored as JSON
[]: Ability to define and run simulation scenarios
[]: Ability to record and save logs (simulation record, see Simulation)

Tooling:
[] Python scripts to plot the modeling data
[] Python scripts for experiment sweeps (generate scenario JSONs, run CLI, collect results)
[] Command line tool to run scenario files

Visualization:
[x]: Web app (React.js)
[]: Visible connections between nodes with indications of packets traveling through them
[]: Connection heatmap: green-to-red gradient by link utilisation / queue fill
[]: Ability to setup, run the simulation and see the result
[]: mouse editing: add, delete, select, drag nodes and links
[]: hover/select info: route table, link weight, buffer load
[]: route tables view for every node (by weight and by hops)
[]: step-by-step algorithm execution (watch tables get learned packet by packet)
[]: step-by-step view of the reference Dijkstra run

Nice to have:
[]: Satellites as nodes, located in orbits over the planet
[]: Uplink node type: ground station that connects to satellites over the air
[]: Satellites can be connected to other satellites over the air
[]: Spherical Earth
[]: Over the air connection is based on line of sight (ignoring terrain, just the sphere intersect test)
[]: Simulate satellites moving around the planet
[]: Rotatable globe
[]: Visible ground stations on the globe
[]: Visible satellites in the near space
[]: Random failures: generator schedules enable/disable events (e.g. MTBF/MTTR distributions) on top of manual toggling
[]: Rewind (low priority): UI loads the recorded event trace and scrubs through it (trace playback, no re-running the engine)
[]: Branching: rewind to t, change something (e.g. toggle a link), continue — via deterministic re-simulation from t=0 (seed + event log)
[]: Progress indicator for long runs: sim time reached, events processed, ETA (engine emits periodic status line)
