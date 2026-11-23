Course project variant 6 checklist:

Model:
[]: TypeScript simulation core, shared by the web UI (runs in a Web Worker) and the Node CLI
[x]: seeded PRNG with independent streams per purpose (topology, traffic, errors, routing), no Math.random; reproducible within one code version only (records keep generated model + traffic, not just the seed)
[]: model/scenario types defined once, shared by core, UI and JSON validation
[x]: Types of nodes: router, workstation
[x]: workstations attached to every k-th router, k in {2, 3, 4}; workstations are the message endpoints
[]: workstation-router links have their own params (ground type, weight, bandwidth, p_bit)
[]: Types of connections: ground, satellite (satellite = higher latency + error probability, used between regional networks)
[]: routers are located at 2D plane coordinates (used for layout and "most distant workstations")
[x]: nodes can be connected into regional networks
[x]: routing algo is the same for all networks
[x]: connections between nodes have a weight, that has to be configured during model creation
[]: weight = routing cost only (input for Dijkstra etc.); timing comes from separate per-link params (bandwidth, propagation delay)
[]: weight must be monotonic with latency for a reference packet size: smaller weight => smaller latency (generator must keep this, e.g. satellite links get weights from the high end of the set)
[x]: per-link attributes: type (ground/satellite), duplex | half-duplex, weight, p_bit (per-bit error probability)
[x]: weight generation policy: constant from set
[x]: messages can be of varying length
[x]: buffers are per router interface (output queue per outgoing line, needed for a*queue_len); size configurable per interface, so the two ends of a link can differ
[x]: buffer size generation policy: constant from set
[x]: buffer overflow: packet dropped, counted as lost

Topology generator:
[x]: random generation with configurable policies (weights, buffers, half-duplex share, p_bit)
[x]: variant 6 preset: 3 regional networks x >= 9 routers, average degree 3.5
[x]: weights from set {3, 5, 7, 8, 11, 12, 15, 18, 21, 25}
[x]: links between regional networks are satellite links
[x]: generated graph must be connected

Time & traffic model (all params configurable in UI + scenario config, with defaults; values saved in the simulation record):
[]: per-hop delay: t_hop = (header + payload)/bandwidth + propagation + queueing + processing
[x]: half-duplex links: one direction at a time, other side waits in queue
[]: bandwidth derived from weight (e.g. bandwidth = K/weight) to keep weight monotonic with latency; propagation per link type (ground ~ms, satellite ~250 ms)
[]: packet formats (bytes): data header, ACK, NACK, VC setup/confirm/teardown; payload size sweep range (e.g. 64 B .. 4 KB)
[]: control packets (ACK, NACK, VC setup/confirm/teardown...) occupy links and queues like data packets
[]: error model: per-bit error prob -> P_packet = 1 - (1 - p_bit)^bits (default) | flat per-packet prob
[]: ACK policy: hop-by-hop | end-to-end (selectable per transmission mode)
[]: retransmission timeout: fixed initial value, then adapted from measured RTT (avoid spurious retx on satellite hops) | fixed value
[]: retry limit, after which the message is counted as failed
[x]: processing delay per node (constant)

Transmission modes:
[]: virtual circuit: setup (request/confirm) -> data over fixed path -> teardown
[]: VC state: per-node circuit table (VC id -> outgoing line), created on setup, removed on teardown/timeout
[]: VC setup request is routed by the local adaptive rule (see Routing); the path it takes is then fixed for the circuit
[]: VC broken by disabled node/link: circuit torn down, source re-runs setup (re-setup counted as control traffic)
[x]: datagram: each packet routed independently, may arrive out of order
[x]: message fragmentation into packets of configurable size (packet size independent of message size)
[x]: reassembly at destination (incl. out-of-order arrival in datagram mode)

Routing (local adaptive, as defined in lecture 12, slide 23: the node chooses routes on its own, without information from other nodes; route tables are loaded centrally in advance; a packet goes along the shortest path, taking the shortest output queue into account):
[]: nodes never exchange routing info at runtime; forwarding uses only the node's own table and its own output queues
[x]: packets carry source, accumulated cost and hop count
[]: route tables computed centrally before the run from the topology: per node, destination -> per outgoing line shortest-path cost (Dijkstra, by weight) and hop count (BFS, by hops) when leaving via that line (gives both Task 2 tables: by weight and by hops)
[]: table destinations = workstations (Task 2 tables are routes to workstations)
[]: forwarding: pick the outgoing line minimizing table_cost_via_line + a*queue_len (a configurable, in cost units per queued packet; a = 0 => fixed shortest path; large a => behaves like hot potato)
[]: candidate lines: never the incoming line; option: any line | only lines that bring the packet closer to the destination (no detours, prevents loops)
[x]: loop protection: TTL + don't send back on the incoming line
[]: table reload: on a topology change (node/link disabled or enabled) the central manager recomputes the tables and loads them into the nodes after a configurable delay; until then nodes forward with stale tables, and packets lost that way are counted (the lecture's "loss during table changes")
[]: comparison policies, selectable per simulation (UI + scenario config): fixed shortest path (a = 0) and hot potato (shortest queue only), to show the effect of the queue term
[]: metric: route oscillation (the lecture's "автоколивання"): packets that revisit a node, and how often a node's chosen line for a destination flips

Simulation:
[x]: Discrete Event Simulation DES 
[x]: simulate communication between nodes
[]: simulate routing with local adaptive routing (static shortest-path tables + output queue length, see Routing section)
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
[]: with a = 0 on an idle network, every packet follows the Dijkstra shortest path from its table

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
[x]: Visible connections between nodes with indications of packets traveling through them
[]: Connection heatmap: green-to-red gradient by link utilisation / queue fill
[]: Ability to setup, run the simulation and see the result
[]: mouse editing: add, delete, select, drag nodes and links
[]: hover/select info: route table, link weight, buffer load
[]: route tables view for every node (by weight and by hops)
[]: step-by-step forwarding (watch each node's line choice: table cost + queue term, per packet)
[]: step-by-step view of the reference Dijkstra run

Nice to have:
[]: nodes have IPv4 addresses as labels only (no aggregation/subnetting logic)
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
[x]: Rewind (low priority): UI loads the recorded event trace and scrubs through it (trace playback, no re-running the engine)
[]: Branching: rewind to t, change something (e.g. toggle a link), continue — via deterministic re-simulation from t=0 (seed + event log)
[]: Progress indicator for long runs: sim time reached, events processed, ETA (engine emits periodic status line)
