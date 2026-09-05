import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as Vector3, a as Text, c as useThree, d as Color, f as Fog, g as ShaderMaterial, h as PlaneGeometry, i as OrbitControls, m as Object3D, n as Stars, o as Canvas, p as MathUtils, r as Sky, s as useFrame, t as Sparkles, u as BufferAttribute, y as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { a as setInjectedKeys, i as sampleActions, n as useGardenStore, r as lookState } from "./routes-BkKkFokX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/GardenCanvas-BwhJ-R5c.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function mulberry32(seed) {
	let a = seed >>> 0;
	return function rand() {
		a |= 0;
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function hash2(x, z) {
	const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
	return n - Math.floor(n);
}
function noise2(x, z) {
	const ix = Math.floor(x);
	const iz = Math.floor(z);
	const fx = x - ix;
	const fz = z - iz;
	const ux = fx * fx * (3 - 2 * fx);
	const uz = fz * fz * (3 - 2 * fz);
	const a = hash2(ix, iz);
	const b = hash2(ix + 1, iz);
	const c = hash2(ix, iz + 1);
	const d = hash2(ix + 1, iz + 1);
	return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}
function fbm(x, z) {
	return noise2(x, z) * .55 + noise2(x * 2.07, z * 2.07) * .28 + noise2(x * 4.13, z * 4.13) * .17;
}
var WATER_Y = .06;
var LAKE_RX = 11.6;
var LAKE_RZ = 8.8;
var FENCE_R = 36.4;
var PATH_R = 15.4;
var PATH_W = 1.45;
var WALK_SPEED = 4.4;
var TURN_RATE = 2.35;
var SPAWN = {
	x: 0,
	z: 17.8,
	yaw: 0
};
var DOCK = {
	minX: -1.35,
	maxX: 1.35,
	minZ: 3.4,
	maxZ: 12.4,
	y: .32
};
function lakeMetric(x, z) {
	return Math.hypot(x / LAKE_RX, z / LAKE_RZ);
}
function onDock(x, z) {
	return x >= DOCK.minX && x <= DOCK.maxX && z >= DOCK.minZ && z <= DOCK.maxZ;
}
function inLake(x, z) {
	return lakeMetric(x, z) < .98 && !onDock(x, z);
}
function isPath(x, z) {
	const pr = Math.hypot(x * .96, z);
	return Math.abs(pr - 15.4) < 1.45 && lakeMetric(x, z) > 1.08;
}
function smoothstep(a, b, x) {
	const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
}
function sampleHeight(x, z) {
	const ld = lakeMetric(x, z);
	const r = Math.hypot(x, z);
	const roll = (fbm(x * .055, z * .055) - .5) * 1.05;
	const fine = (fbm(x * .18, z * .18) - .5) * .22;
	const north = Math.max(0, -z - 20);
	const rim = Math.max(0, r - 40);
	const hills = north * .22 + rim * .5 + Math.max(0, r - 28) * (fbm(x * .03, z * .03) - .2) * .7;
	if (ld < .9) return -1.45 + ld * .35;
	if (ld < 1.22) {
		const t = smoothstep(.9, 1.22, ld);
		return -1.1 * (1 - t) + (.1 + roll * .25 + fine) * t;
	}
	let h = .12 + roll + fine + hills;
	const pr = Math.hypot(x * .96, z);
	const pd = Math.abs(pr - PATH_R);
	if (pd < 1.45 && ld > 1.05) {
		const f = 1 - pd / PATH_W;
		h = h * (1 - f * .85) + .13 * f * .85;
	}
	if (onDock(x, z)) return DOCK.y;
	return h;
}
function sampleWalkHeight(x, z) {
	if (onDock(x, z)) return DOCK.y;
	return Math.max(sampleHeight(x, z), .08);
}
function canWalk(x, z) {
	if (Math.hypot(x, z) > 35.35) return false;
	if (inLake(x, z)) return false;
	return true;
}
function sunDirection(hour) {
	const elev = Math.sin((hour - 6) / 12 * Math.PI);
	const az = (hour - 12) / 12 * Math.PI * .92;
	const x = Math.sin(az) * 90;
	const z = Math.cos(az) * 36 - 8;
	return {
		x,
		y: elev * 88,
		z,
		elev
	};
}
function timePalette(hour) {
	const elev = Math.sin((hour - 6) / 12 * Math.PI);
	const day = smoothstep(-.15, .35, elev);
	const night = 1 - day;
	const golden = smoothstep(.02, .18, elev) * smoothstep(.45, .12, elev);
	const fogDay = [
		197,
		214,
		196
	];
	const fogDusk = [
		232,
		176,
		128
	];
	return {
		fog: rgb(mix3(mix3([
			18,
			24,
			36
		], fogDusk, golden), mix3(fogDusk, fogDay, day), day)),
		ambient: rgb(mix3([
			28,
			34,
			52
		], [
			210,
			220,
			230
		], day)),
		hemiSky: rgb(mix3([
			40,
			50,
			78
		], [
			186,
			214,
			232
		], day)),
		hemiGround: rgb(mix3([
			24,
			28,
			22
		], [
			92,
			110,
			64
		], day)),
		sun: rgb(mix3([
			180,
			196,
			230
		], mix3([
			255,
			176,
			92
		], [
			255,
			244,
			214
		], day), Math.max(day, golden))),
		sunIntensity: .12 + day * 1.55 + golden * .35,
		ambientIntensity: .18 + day * .42,
		exposure: .55 + day * .55 + golden * .12,
		skyTurbidity: 8 + golden * 6 + night * 2,
		skyRayleigh: .6 + day * 2.2,
		night
	};
}
function mix3(a, b, t) {
	const k = Math.min(1, Math.max(0, t));
	return [
		a[0] + (b[0] - a[0]) * k,
		a[1] + (b[1] - a[1]) * k,
		a[2] + (b[2] - a[2]) * k
	];
}
function rgb(c) {
	return `rgb(${c[0] | 0} ${c[1] | 0} ${c[2] | 0})`;
}
var rand = mulberry32(1597463007);
function blocked(x, z, extra = 0) {
	if (lakeMetric(x, z) < 1.28 + extra * .04) return true;
	if (Math.hypot(x, z) > 33.6) return true;
	if (Math.hypot(x, z - 17.8) < 4.2) return true;
	if (isPath(x, z)) return true;
	if (onDock(x, z)) return true;
	if (Math.hypot(x - 7.5, z - 28.5) < 4.2) return true;
	if (Math.hypot(x + 13.5, z + 1.2) < 4) return true;
	if (Math.hypot(x + 1, z - 11.5) < 2.4) return true;
	return false;
}
function scatter(count, kind) {
	const out = [];
	let guard = 0;
	while (out.length < count && guard < count * 40) {
		guard += 1;
		const ang = rand() * Math.PI * 2;
		const rad = kind === "grass" ? 8 + rand() * 26 : 12 + rand() * 22;
		const x = Math.cos(ang) * rad * (.85 + rand() * .3);
		const z = Math.sin(ang) * rad;
		if (blocked(x, z, kind === "tree" ? .6 : 0)) continue;
		if (kind === "grass" && lakeMetric(x, z) < 1.15) continue;
		if (out.some((s) => {
			const min = kind === "tree" ? 2.6 : kind === "bush" ? 1.4 : .7;
			return Math.hypot(s.x - x, s.z - z) < min;
		})) continue;
		out.push({
			x,
			y: sampleHeight(x, z),
			z,
			scale: kind === "tree" ? .85 + rand() * .55 : kind === "bush" ? .7 + rand() * .55 : .55 + rand() * .7,
			rot: rand() * Math.PI * 2,
			variant: rand()
		});
	}
	return out;
}
function placeShoreWillows() {
	return [
		[-9.4, 4.2],
		[-11.2, -2.6],
		[10.8, 3.1],
		[8.6, -6.4],
		[-4.8, -8.6]
	].map(([x, z], i) => ({
		x,
		y: sampleHeight(x, z),
		z,
		scale: 1.05 + i % 3 * .12,
		rot: i * 1.1,
		variant: i / 5
	}));
}
var OAKS = scatter(38, "tree");
var PINES = scatter(18, "tree").filter((s) => s.z < 8 || Math.hypot(s.x, s.z) > 20);
var WILLOWS = placeShoreWillows();
var BUSHES = scatter(48, "bush");
var STONES = scatter(34, "stone");
var GRASS = scatter(780, "grass");
var FLOWER_BEDS = [
	{
		id: "east-meadow",
		x: 18.5,
		z: 6.5,
		y: 0,
		radius: 3.2
	},
	{
		id: "south-bed",
		x: -6.5,
		z: 17.4,
		y: 0,
		radius: 2.4
	},
	{
		id: "west-bank",
		x: -18.2,
		z: 4.8,
		y: 0,
		radius: 2.8
	},
	{
		id: "north-grove",
		x: 6.4,
		z: -16.5,
		y: 0,
		radius: 2.6
	},
	{
		id: "gate-patch",
		x: 4.8,
		z: 24.2,
		y: 0,
		radius: 2.1
	},
	{
		id: "gazebo-ring",
		x: -13.5,
		z: -6.4,
		y: 0,
		radius: 2.3
	}
].map((b) => ({
	...b,
	y: sampleHeight(b.x, b.z)
}));
var BENCHES = [
	{
		id: "south-bench",
		x: -4.6,
		z: 12.6,
		yaw: -.4
	},
	{
		id: "west-bench",
		x: -16.4,
		z: 1.2,
		yaw: 1.15
	},
	{
		id: "dock-bench",
		x: 3.6,
		z: 11.2,
		yaw: -.2
	}
].map((b) => ({
	...b,
	y: sampleHeight(b.x, b.z)
}));
var GAZEBO = {
	x: -13.6,
	z: 1.1,
	y: sampleHeight(-13.6, 1.1)
};
var COTTAGE = {
	x: 7.6,
	z: 28.4,
	y: sampleHeight(7.6, 28.4)
};
var HILLS = [
	{
		x: -18,
		z: -62,
		s: 18,
		h: 16
	},
	{
		x: 8,
		z: -70,
		s: 22,
		h: 20
	},
	{
		x: 32,
		z: -58,
		s: 16,
		h: 14
	},
	{
		x: -42,
		z: -48,
		s: 14,
		h: 11
	},
	{
		x: 48,
		z: -42,
		s: 15,
		h: 12
	},
	{
		x: -8,
		z: -78,
		s: 26,
		h: 24
	}
];
function fencePosts() {
	const posts = [];
	const n = 92;
	for (let i = 0; i < n; i++) {
		const t = i / n * Math.PI * 2;
		const around = (t + Math.PI / 2) % (Math.PI * 2) - Math.PI;
		if (Math.abs(around) < .22) continue;
		const x = Math.cos(t) * FENCE_R;
		const z = Math.sin(t) * FENCE_R;
		posts.push({
			x,
			y: sampleHeight(x, z),
			z,
			scale: 1,
			rot: t,
			variant: i
		});
	}
	return posts;
}
var FENCE_POSTS = fencePosts();
var playerSim = {
	x: SPAWN.x,
	y: 0,
	z: SPAWN.z,
	yaw: SPAWN.yaw,
	speed: 0
};
var movers = {};
var steerOverride = { value: null };
var tmpFwd = new Vector3();
var tmpCam = new Vector3();
var tmpLook = new Vector3();
var tmpDesired = new Vector3();
function Player() {
	const group = (0, import_react.useRef)(null);
	const playing = useGardenStore((s) => s.playing);
	const seated = useGardenStore((s) => s.seated);
	const cameraMode = useGardenStore((s) => s.cameraMode);
	(0, import_react.useEffect)(() => {
		window.__controlsTest = {
			getYaw: () => playerSim.yaw,
			getSpeed: () => playerSim.speed,
			getPos: () => ({
				x: playerSim.x,
				y: playerSim.y,
				z: playerSim.z
			}),
			setSteer: (v) => {
				steerOverride.value = v;
			},
			setKeys: (codes) => {
				setInjectedKeys(codes);
				if (codes.length) useGardenStore.getState().enter();
			}
		};
		return () => {
			delete window.__controlsTest;
		};
	}, []);
	useFrame((state, delta) => {
		const dt = Math.min(delta, .1);
		const { throttle, steer: keySteer, interactPressed } = sampleActions();
		const steer = MathUtils.clamp(keySteer + (steerOverride.value ?? 0), -1, 1);
		if (playing && !seated && cameraMode === "follow") {
			playerSim.yaw += steer * TURN_RATE * dt;
			const target = throttle * WALK_SPEED;
			playerSim.speed += (target - playerSim.speed) * Math.min(1, dt * 6);
			const fx = -Math.sin(playerSim.yaw);
			const fz = -Math.cos(playerSim.yaw);
			let nx = playerSim.x + fx * playerSim.speed * dt;
			let nz = playerSim.z + fz * playerSim.speed * dt;
			if (!canWalk(nx, nz)) {
				if (canWalk(nx, playerSim.z)) nz = playerSim.z;
				else if (canWalk(playerSim.x, nz)) nx = playerSim.x;
				else {
					nx = playerSim.x;
					nz = playerSim.z;
					playerSim.speed = 0;
				}
			}
			playerSim.x = nx;
			playerSim.z = nz;
		} else playerSim.speed = 0;
		playerSim.y = sampleWalkHeight(playerSim.x, playerSim.z);
		if (group.current) {
			const bob = playing && !seated ? Math.sin(state.clock.elapsedTime * 8) * Math.min(1, Math.abs(playerSim.speed) / WALK_SPEED) * .04 : 0;
			group.current.position.set(playerSim.x, playerSim.y + bob, playerSim.z);
			group.current.rotation.y = playerSim.yaw;
		}
		if (interactPressed && playing) handleInteract(playerSim.x, playerSim.z);
		else if (playing) updateNearby(playerSim.x, playerSim.z);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
		ref: group,
		visible: playing,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gardener, {})
	});
}
function Gardener() {
	const legs = (0, import_react.useRef)(null);
	useFrame((state) => {
		if (!legs.current) return;
		const k = Math.min(1, Math.abs(playerSim.speed) / WALK_SPEED);
		legs.current.children.forEach((ch, i) => {
			ch.rotation.x = Math.sin(state.clock.elapsedTime * 8 + i * Math.PI) * .55 * k;
		});
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				.95,
				0
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
				.22,
				.55,
				4,
				8
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#e6dcc8" })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				1.52,
				0
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
				.18,
				8,
				6
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#e8c8a8" })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				1.68,
				0
			],
			rotation: [
				.05,
				0,
				0
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
				.28,
				.28,
				.04,
				10
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#c4a574" })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				1.78,
				0
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [
				.16,
				.22,
				8
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#b7925e" })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
			ref: legs,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					-.1,
					.32,
					0
				],
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
					.07,
					.38,
					3,
					6
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#5c6b4a" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					.1,
					.32,
					0
				],
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
					.07,
					.38,
					3,
					6
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#5c6b4a" })]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				-.28,
				1.05,
				0
			],
			rotation: [
				0,
				0,
				.4
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
				.05,
				.32,
				3,
				6
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#e6dcc8" })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				.28,
				1.05,
				0
			],
			rotation: [
				0,
				0,
				-.4
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
				.05,
				.32,
				3,
				6
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#e6dcc8" })]
		})
	] });
}
function CameraDirector() {
	const { camera, gl } = useThree();
	const playing = useGardenStore((s) => s.playing);
	const cameraMode = useGardenStore((s) => s.cameraMode);
	const seated = useGardenStore((s) => s.seated);
	const introT = (0, import_react.useRef)(.6);
	(0, import_react.useEffect)(() => {
		const el = gl.domElement;
		const onDown = (e) => {
			if (e.pointerType === "touch" && e.clientX < window.innerWidth * .38) return;
			lookState.dragging = true;
			lookState.pointerId = e.pointerId;
			try {
				el.setPointerCapture(e.pointerId);
			} catch {}
		};
		const onMove = (e) => {
			if (!lookState.dragging || e.pointerId !== lookState.pointerId) return;
			lookState.yaw -= e.movementX * .005;
			lookState.pitch = MathUtils.clamp(lookState.pitch + e.movementY * .003, -.15, .7);
		};
		const onUp = (e) => {
			if (e.pointerId !== lookState.pointerId) return;
			lookState.dragging = false;
			lookState.pointerId = -1;
		};
		el.addEventListener("pointerdown", onDown);
		el.addEventListener("pointermove", onMove);
		el.addEventListener("pointerup", onUp);
		el.addEventListener("pointercancel", onUp);
		return () => {
			el.removeEventListener("pointerdown", onDown);
			el.removeEventListener("pointermove", onMove);
			el.removeEventListener("pointerup", onUp);
			el.removeEventListener("pointercancel", onUp);
		};
	}, [gl]);
	useFrame((_, delta) => {
		const dt = Math.min(delta, .1);
		if (!playing) {
			introT.current += dt * .08;
			const t = introT.current;
			camera.position.set(Math.sin(t) * 28, 12.5 + Math.sin(t * .7) * 1.4, Math.cos(t) * 28);
			camera.lookAt(0, .6, 0);
			return;
		}
		if (cameraMode === "orbit") return;
		if (!lookState.dragging) lookState.yaw *= Math.exp(-dt * 1.4);
		const yaw = playerSim.yaw + lookState.yaw;
		tmpFwd.set(-Math.sin(yaw), 0, -Math.cos(yaw));
		const dist = seated ? 3.6 : 5.2;
		const height = seated ? 1.7 : 2.35 + lookState.pitch * 2.4;
		tmpDesired.copy(tmpFwd).multiplyScalar(-dist);
		tmpDesired.y += height;
		tmpDesired.x += playerSim.x;
		tmpDesired.z += playerSim.z;
		tmpDesired.y += playerSim.y;
		const k = 1 - Math.exp(-dt * 5.5);
		tmpCam.copy(camera.position).lerp(tmpDesired, k);
		camera.position.copy(tmpCam);
		tmpLook.set(playerSim.x + tmpFwd.x * 4.2, playerSim.y + (seated ? .95 : 1.15), playerSim.z + tmpFwd.z * 4.2);
		camera.lookAt(tmpLook);
	});
	return null;
}
function updateNearby(x, z) {
	const store = useGardenStore.getState();
	if (store.seated) {
		store.setNearby("stand");
		store.setHint("Press E to stand");
		return;
	}
	let best = null;
	for (const b of BENCHES) {
		const d = Math.hypot(b.x - x, b.z - z);
		if (d < 2.2 && (!best || d < best.d)) best = {
			id: b.id,
			d,
			hint: "Press E to sit and watch the lake"
		};
	}
	for (const bed of FLOWER_BEDS) {
		if (store.pickedBeds.includes(bed.id)) continue;
		const d = Math.hypot(bed.x - x, bed.z - z);
		if (d < 2.4 && (!best || d < best.d)) best = {
			id: bed.id,
			d,
			hint: "Press E to gather flowers"
		};
	}
	for (const [id, m] of Object.entries(movers)) {
		const d = Math.hypot(m.x - x, m.z - z);
		if (d < 2.6 && (!best || d < best.d)) best = {
			id,
			d,
			hint: `${m.label}. Press E to linger.`
		};
	}
	if (!best) {
		if (store.nearby) store.setNearby(null);
		if (store.hint && !store.hint.startsWith("You ")) store.setHint(null);
		return;
	}
	store.setNearby(best.id);
	store.setHint(best.hint);
}
function handleInteract(x, z) {
	const store = useGardenStore.getState();
	if (store.seated) {
		store.setSeated(false);
		store.setHint(null);
		return;
	}
	for (const b of BENCHES) if (Math.hypot(b.x - x, b.z - z) < 2.2) {
		playerSim.x = b.x;
		playerSim.z = b.z + .15;
		playerSim.yaw = b.yaw + Math.PI;
		store.setSeated(true);
		store.setHint("The lake holds still. Press E to stand.");
		return;
	}
	for (const bed of FLOWER_BEDS) {
		if (store.pickedBeds.includes(bed.id)) continue;
		if (Math.hypot(bed.x - x, bed.z - z) < 2.4) {
			store.pickBed(bed.id);
			return;
		}
	}
	for (const m of Object.values(movers)) if (Math.hypot(m.x - x, m.z - z) < 2.6) {
		store.setHint(`${m.label}.`);
		return;
	}
}
function SkyAtmosphere() {
	const hour = useGardenStore((s) => s.timeOfDay);
	const autoTime = useGardenStore((s) => s.autoTime);
	const setTime = useGardenStore((s) => s.setTimeOfDay);
	const pal = timePalette(hour);
	const sun = sunDirection(hour);
	const fog = useThree((s) => s.scene.fog);
	const gl = useThree((s) => s.gl);
	const acc = (0, import_react.useRef)(0);
	const sunPos = (0, import_react.useMemo)(() => new Vector3(sun.x, Math.max(sun.y, 2), sun.z), [
		sun.x,
		sun.y,
		sun.z
	]);
	useFrame((_, delta) => {
		const dt = Math.min(delta, .1);
		if (autoTime) {
			acc.current += dt;
			if (acc.current > .4) {
				acc.current = 0;
				const next = (useGardenStore.getState().timeOfDay + .14) % 24;
				setTime(next);
			}
		}
		if (fog && fog instanceof Fog) fog.color.set(pal.fog);
		gl.toneMappingExposure = pal.exposure;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("color", {
			attach: "background",
			args: [pal.fog]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("fog", {
			attach: "fog",
			args: [
				pal.fog,
				38,
				125
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", { args: [
			pal.hemiSky,
			pal.hemiGround,
			pal.ambientIntensity
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", {
			intensity: pal.ambientIntensity * .45,
			color: pal.ambient
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
			position: [
				sun.x,
				Math.max(sun.y, 6),
				sun.z
			],
			intensity: pal.sunIntensity,
			color: pal.sun,
			castShadow: true,
			"shadow-mapSize-width": 2048,
			"shadow-mapSize-height": 2048,
			"shadow-camera-near": 2,
			"shadow-camera-far": 140,
			"shadow-camera-left": -42,
			"shadow-camera-right": 42,
			"shadow-camera-top": 42,
			"shadow-camera-bottom": -42,
			"shadow-bias": -4e-4
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sky, {
			sunPosition: sunPos,
			turbidity: pal.skyTurbidity,
			rayleigh: pal.skyRayleigh,
			mieCoefficient: .005,
			mieDirectionalG: .8
		}),
		pal.night > .35 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, {
			radius: 110,
			depth: 30,
			count: 800,
			factor: 3.2,
			fade: true,
			speed: .4,
			saturation: 0
		}),
		pal.night > .28 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
			count: 48,
			size: 2.6,
			scale: [
				34,
				5,
				34
			],
			position: [
				0,
				2.2,
				0
			],
			speed: .35,
			opacity: pal.night * .85,
			color: "#e7efc8"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudField, { night: pal.night })
	] });
}
function CloudField({ night }) {
	const group = (0, import_react.useRef)(null);
	const tint = night > .55 ? "#9aa6b8" : "#f4f6f8";
	useFrame((_, delta) => {
		if (!group.current) return;
		group.current.rotation.y += Math.min(delta, .1) * .012;
	});
	const puffs = (0, import_react.useMemo)(() => [
		[
			18,
			22,
			-24,
			1.3
		],
		[
			-22,
			20,
			-18,
			1.6
		],
		[
			8,
			24,
			28,
			1.1
		],
		[
			-30,
			21,
			10,
			1.4
		],
		[
			32,
			23,
			6,
			1.2
		],
		[
			-6,
			26,
			-34,
			1.8
		],
		[
			24,
			19,
			22,
			1
		],
		[
			-14,
			22,
			30,
			1.25
		]
	], []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
		ref: group,
		children: puffs.map(([x, y, z, s], i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
			position: [
				x,
				y,
				z
			],
			scale: s,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					2.2,
					8,
					6
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshLambertMaterial", { color: tint })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						1.8,
						.25,
						.4
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
						1.55,
						8,
						6
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshLambertMaterial", { color: tint })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						-1.6,
						.15,
						.2
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
						1.4,
						8,
						6
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshLambertMaterial", { color: tint })]
				})
			]
		}, i))
	});
}
var _dummy$1 = new Object3D();
function Structures() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fence, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dock, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gazebo, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cottage, {}),
		BENCHES.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bench, {
			x: b.x,
			y: b.y,
			z: b.z,
			yaw: b.yaw
		}, b.id)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lantern, {
			x: GAZEBO.x + 2.4,
			z: GAZEBO.z + 2
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lantern, {
			x: 1.8,
			z: 11.6
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lantern, {
			x: COTTAGE.x - 2.2,
			z: COTTAGE.z + 1.6
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GateSign, {})
	] });
}
function Fence() {
	const posts = (0, import_react.useRef)(null);
	const rails = (0, import_react.useRef)(null);
	const n = FENCE_POSTS.length;
	(0, import_react.useLayoutEffect)(() => {
		if (!posts.current || !rails.current) return;
		for (let i = 0; i < n * 2; i++) {
			_dummy$1.position.set(0, -40, 0);
			_dummy$1.scale.set(0, 0, 0);
			_dummy$1.rotation.set(0, 0, 0);
			_dummy$1.updateMatrix();
			rails.current.setMatrixAt(i, _dummy$1.matrix);
		}
		FENCE_POSTS.forEach((s, i) => {
			_dummy$1.position.set(s.x, s.y + .7, s.z);
			_dummy$1.rotation.set(0, s.rot, 0);
			_dummy$1.scale.set(1, 1, 1);
			_dummy$1.updateMatrix();
			posts.current.setMatrixAt(i, _dummy$1.matrix);
			const next = FENCE_POSTS[(i + 1) % n];
			const dx = next.x - s.x;
			const dz = next.z - s.z;
			const dist = Math.hypot(dx, dz);
			if (dist > 3.2) return;
			const midX = (s.x + next.x) / 2;
			const midZ = (s.z + next.z) / 2;
			const yaw = Math.atan2(dx, dz);
			for (let r = 0; r < 2; r++) {
				const idx = i * 2 + r;
				_dummy$1.position.set(midX, s.y + .35 + r * .42, midZ);
				_dummy$1.rotation.set(0, yaw, 0);
				_dummy$1.scale.set(.08, .07, dist);
				_dummy$1.updateMatrix();
				rails.current.setMatrixAt(idx, _dummy$1.matrix);
			}
		});
		posts.current.instanceMatrix.needsUpdate = true;
		rails.current.instanceMatrix.needsUpdate = true;
	}, [n]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref: posts,
		args: [
			void 0,
			void 0,
			n
		],
		castShadow: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			.14,
			1.4,
			.14
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#6b5344",
			roughness: .88
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref: rails,
		args: [
			void 0,
			void 0,
			n * 2
		],
		castShadow: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			1,
			1,
			1
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#7a624c",
			roughness: .86
		})]
	})] });
}
function Dock() {
	const y = DOCK.y;
	const len = DOCK.maxZ - DOCK.minZ;
	const zc = (DOCK.minZ + DOCK.maxZ) / 2;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				y,
				zc
			],
			receiveShadow: true,
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				2.5,
				.12,
				len
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#8a6a4a",
				roughness: .8
			})]
		}),
		[-1.05, 1.05].map((x) => [
			4.2,
			6.8,
			9.4,
			11.6
		].map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				x,
				WATER_Y - .35,
				z
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
				.09,
				.11,
				1.1,
				6
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#5c4636" })]
		}, `${x}-${z}`))),
		Array.from({ length: 9 }, (_, i) => {
			const z = DOCK.minZ + .5 + i * 1.05;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					y + .07,
					z
				],
				receiveShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					2.45,
					.05,
					.9
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: i % 2 ? "#7a5a3c" : "#8d6b48" })]
			}, i);
		})
	] });
}
function Gazebo() {
	const { x, y, z } = GAZEBO;
	const posts = Array.from({ length: 6 }, (_, i) => i);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position: [
			x,
			y,
			z
		],
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.06,
					0
				],
				receiveShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
					2.15,
					2.15,
					.1,
					6
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#cfc4ae" })]
			}),
			posts.map((i) => {
				const a = i / 6 * Math.PI * 2;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						Math.cos(a) * 1.85,
						1.15,
						Math.sin(a) * 1.85
					],
					castShadow: true,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
						.08,
						.09,
						2.2,
						6
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#7a6248" })]
				}, i);
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					2.55,
					0
				],
				rotation: [
					0,
					Math.PI / 6,
					0
				],
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [
					2.55,
					1.15,
					6
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#6e4e3a",
					roughness: .78
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					3.2,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					.12,
					8,
					6
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#c9a06a" })]
			})
		]
	});
}
function Cottage() {
	const { x, y, z } = COTTAGE;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position: [
			x,
			y,
			z
		],
		rotation: [
			0,
			-.35,
			0
		],
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					1.15,
					0
				],
				castShadow: true,
				receiveShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					4.2,
					2.3,
					3.2
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#cbb79a",
					roughness: .9
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					2.85,
					0
				],
				rotation: [
					0,
					Math.PI / 4,
					0
				],
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [
					3.15,
					1.6,
					4
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#6a4332" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					1.55,
					3.35,
					.2
				],
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.45,
					.9,
					.45
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#7a5a4a" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.7,
					1.62
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.7,
					1.35,
					.08
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#4a3226" })]
			}),
			[-1.1, 1.1].map((wx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					wx,
					1.35,
					1.62
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.55,
					.5,
					.06
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#87a8b0",
					emissive: "#1a3038",
					emissiveIntensity: .4
				})]
			}, wx))
		]
	});
}
function Bench({ x, y, z, yaw }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position: [
			x,
			y,
			z
		],
		rotation: [
			0,
			yaw,
			0
		],
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.42,
					0
				],
				castShadow: true,
				receiveShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					1.6,
					.1,
					.5
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#7a5a40" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.72,
					-.22
				],
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					1.6,
					.42,
					.08
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#6e5138" })]
			}),
			[-.65, .65].map((lx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					lx,
					.2,
					.12
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.08,
					.4,
					.08
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#5a4030" })]
			}, lx))
		]
	});
}
function Lantern({ x, z }) {
	const y = sampleHeight(x, z);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position: [
			x,
			y,
			z
		],
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.7,
					0
				],
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
					.05,
					.06,
					1.4,
					6
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#4a3a2c" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					1.45,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					.16,
					8,
					6
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#f0d9a0",
					emissive: "#f0c878",
					emissiveIntensity: 1.2
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
				position: [
					0,
					1.45,
					0
				],
				intensity: .85,
				distance: 8,
				color: "#ffd7a0"
			})
		]
	});
}
function GateSign() {
	const z = FENCE_R - .2;
	const y = sampleHeight(0, z);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position: [
			0,
			y,
			z + .4
		],
		children: [
			[-1.6, 1.6].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					x,
					1.05,
					0
				],
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.12,
					2.1,
					.12
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#5c4638" })]
			}, x)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					1.55,
					0
				],
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					3.2,
					.9,
					.1
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#6e5340" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				position: [
					0,
					1.55,
					.07
				],
				fontSize: .32,
				color: "#f3efe4",
				anchorX: "center",
				anchorY: "middle",
				letterSpacing: .04,
				children: "WILLOWMERE"
			})
		]
	});
}
var _dummy = new Object3D();
function Vegetation() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OakField, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PineField, {}),
		WILLOWS.map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Willow, {
			x: w.x,
			y: w.y,
			z: w.z,
			scale: w.scale,
			rot: w.rot
		}, i)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BushField, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoneField, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GrassField, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowerBeds, {})
	] });
}
function OakField() {
	const trunk = (0, import_react.useRef)(null);
	const canopy = (0, import_react.useRef)(null);
	const n = OAKS.length;
	(0, import_react.useLayoutEffect)(() => {
		if (!trunk.current || !canopy.current) return;
		OAKS.forEach((s, i) => {
			_dummy.position.set(s.x, s.y + .85 * s.scale, s.z);
			_dummy.rotation.set(0, s.rot, 0);
			_dummy.scale.set(s.scale, s.scale, s.scale);
			_dummy.updateMatrix();
			trunk.current.setMatrixAt(i, _dummy.matrix);
			const c = new Color().setHSL(.28 + s.variant * .06, .45, .28 + s.variant * .08);
			for (let k = 0; k < 3; k++) {
				const idx = i * 3 + k;
				const ox = (k - 1) * .55 * s.scale;
				const oy = (2.15 + (k === 1 ? .45 : 0)) * s.scale;
				const oz = (k === 2 ? .4 : -.15) * s.scale;
				_dummy.position.set(s.x + ox, s.y + oy, s.z + oz);
				_dummy.scale.setScalar((.85 + k * .12) * s.scale);
				_dummy.updateMatrix();
				canopy.current.setMatrixAt(idx, _dummy.matrix);
				canopy.current.setColorAt(idx, c);
			}
		});
		trunk.current.instanceMatrix.needsUpdate = true;
		canopy.current.instanceMatrix.needsUpdate = true;
		if (canopy.current.instanceColor) canopy.current.instanceColor.needsUpdate = true;
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref: trunk,
		args: [
			void 0,
			void 0,
			n
		],
		castShadow: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
			.16,
			.22,
			1.7,
			6
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#5a4030",
			roughness: .9
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref: canopy,
		args: [
			void 0,
			void 0,
			n * 3
		],
		castShadow: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("icosahedronGeometry", { args: [1, 0] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { roughness: .78 })]
	})] });
}
function PineField() {
	const trunk = (0, import_react.useRef)(null);
	const leaf = (0, import_react.useRef)(null);
	const n = PINES.length;
	(0, import_react.useLayoutEffect)(() => {
		if (!trunk.current || !leaf.current) return;
		PINES.forEach((s, i) => {
			_dummy.position.set(s.x, s.y + .9 * s.scale, s.z);
			_dummy.rotation.set(0, s.rot, 0);
			_dummy.scale.set(s.scale, s.scale * 1.15, s.scale);
			_dummy.updateMatrix();
			trunk.current.setMatrixAt(i, _dummy.matrix);
			const c = new Color().setHSL(.32, .42, .22 + s.variant * .08);
			for (let k = 0; k < 2; k++) {
				const idx = i * 2 + k;
				_dummy.position.set(s.x, s.y + (1.7 + k * 1.05) * s.scale, s.z);
				_dummy.scale.set((1.15 - k * .32) * s.scale, (1.2 - k * .1) * s.scale, (1.15 - k * .32) * s.scale);
				_dummy.updateMatrix();
				leaf.current.setMatrixAt(idx, _dummy.matrix);
				leaf.current.setColorAt(idx, c);
			}
		});
		trunk.current.instanceMatrix.needsUpdate = true;
		leaf.current.instanceMatrix.needsUpdate = true;
		if (leaf.current.instanceColor) leaf.current.instanceColor.needsUpdate = true;
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref: trunk,
		args: [
			void 0,
			void 0,
			n
		],
		castShadow: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
			.12,
			.18,
			1.8,
			6
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#4a372c" })]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref: leaf,
		args: [
			void 0,
			void 0,
			n * 2
		],
		castShadow: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [
			1,
			1.6,
			7
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {})]
	})] });
}
function Willow({ x, y, z, scale, rot }) {
	const leaves = (0, import_react.useRef)(null);
	useFrame((state) => {
		if (!leaves.current) return;
		leaves.current.rotation.z = Math.sin(state.clock.elapsedTime * .8 + rot) * .05;
	});
	const strands = (0, import_react.useMemo)(() => Array.from({ length: 10 }, (_, i) => i), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position: [
			x,
			y,
			z
		],
		rotation: [
			0,
			rot,
			0
		],
		scale,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				.15,
				1.5,
				0
			],
			rotation: [
				0,
				0,
				.18
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
				.14,
				.22,
				3.1,
				6
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#6a5040" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
			ref: leaves,
			position: [
				.55,
				3.1,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("icosahedronGeometry", { args: [1.15, 0] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#3d7a48",
					roughness: .75
				})]
			}), strands.map((i) => {
				const a = i / 10 * Math.PI * 2;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						Math.cos(a) * .7,
						-1.15,
						Math.sin(a) * .7
					],
					castShadow: true,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
						.12,
						1.8,
						.04
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: i % 2 ? "#2f6a3c" : "#4a8a52" })]
				}, i);
			})]
		})]
	});
}
function BushField() {
	const mesh = (0, import_react.useRef)(null);
	(0, import_react.useLayoutEffect)(() => {
		if (!mesh.current) return;
		BUSHES.forEach((s, i) => {
			_dummy.position.set(s.x, s.y + .35 * s.scale, s.z);
			_dummy.rotation.set(0, s.rot, 0);
			_dummy.scale.set(s.scale * 1.1, s.scale * .7, s.scale * 1.1);
			_dummy.updateMatrix();
			mesh.current.setMatrixAt(i, _dummy.matrix);
			mesh.current.setColorAt(i, new Color().setHSL(.3, .4, .24 + s.variant * .1));
		});
		mesh.current.instanceMatrix.needsUpdate = true;
		if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref: mesh,
		args: [
			void 0,
			void 0,
			BUSHES.length
		],
		castShadow: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("icosahedronGeometry", { args: [.7, 0] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { roughness: .85 })]
	});
}
function StoneField() {
	const mesh = (0, import_react.useRef)(null);
	(0, import_react.useLayoutEffect)(() => {
		if (!mesh.current) return;
		STONES.forEach((s, i) => {
			_dummy.position.set(s.x, s.y + .18 * s.scale, s.z);
			_dummy.rotation.set(s.variant, s.rot, s.variant * .4);
			_dummy.scale.set(s.scale, s.scale * .7, s.scale * .85);
			_dummy.updateMatrix();
			mesh.current.setMatrixAt(i, _dummy.matrix);
		});
		mesh.current.instanceMatrix.needsUpdate = true;
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref: mesh,
		args: [
			void 0,
			void 0,
			STONES.length
		],
		castShadow: true,
		receiveShadow: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("icosahedronGeometry", { args: [.45, 0] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#8a8680",
			roughness: .95,
			flatShading: true
		})]
	});
}
function GrassField() {
	const mesh = (0, import_react.useRef)(null);
	(0, import_react.useLayoutEffect)(() => {
		if (!mesh.current) return;
		const c = new Color();
		GRASS.forEach((s, i) => {
			_dummy.position.set(s.x, s.y + .16, s.z);
			_dummy.rotation.set(.1 * s.variant, s.rot, .08 * (s.variant - .5));
			_dummy.scale.set(.45 + s.variant * .3, .7 + s.variant * .5, .45);
			_dummy.updateMatrix();
			mesh.current.setMatrixAt(i, _dummy.matrix);
			c.setHSL(.27 + s.variant * .08, .55, .32);
			mesh.current.setColorAt(i, c);
		});
		mesh.current.instanceMatrix.needsUpdate = true;
		if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref: mesh,
		args: [
			void 0,
			void 0,
			GRASS.length
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [
			.18,
			.55,
			5
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {})]
	});
}
function FlowerBeds() {
	const picked = useGardenStore((s) => s.pickedBeds);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { children: FLOWER_BEDS.map((bed) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowerBedMesh, {
		bed,
		picked: picked.includes(bed.id)
	}, bed.id)) });
}
function FlowerBedMesh({ bed, picked }) {
	const blooms = (0, import_react.useMemo)(() => {
		const arr = [];
		for (let i = 0; i < 14; i++) {
			const a = i / 14 * Math.PI * 2 + bed.x;
			const r = .35 + i % 5 * .28;
			arr.push({
				x: Math.cos(a) * r,
				z: Math.sin(a) * r,
				hue: [
					.95,
					.08,
					.62,
					0,
					.12
				][i % 5],
				h: .18 + i % 3 * .05
			});
		}
		return arr;
	}, [bed.x]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
		position: [
			bed.x,
			bed.y,
			bed.z
		],
		visible: !picked,
		children: blooms.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
			position: [
				b.x,
				0,
				b.z
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					b.h * .5,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
					.02,
					.025,
					b.h,
					4
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#3d6a38" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					b.h + .07,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					.08,
					6,
					5
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: new Color().setHSL(b.hue, .45, .62) })]
			})]
		}, i))
	});
}
var lookTmp = new Vector3();
function Wildlife() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		Array.from({ length: 5 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Duck, { seed: i }, i)),
		Array.from({ length: 4 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rabbit, { seed: i }, i)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Deer, {
			seed: 0,
			anchor: [-10, -14]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Deer, {
			seed: 1,
			anchor: [-6.5, -17]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fox, {}),
		Array.from({ length: 8 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bird, { seed: i }, i)),
		Array.from({ length: 7 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Butterfly, { seed: i }, i))
	] });
}
function Duck({ seed }) {
	const ref = (0, import_react.useRef)(null);
	const phase = seed * 1.7;
	useFrame((state) => {
		const t = state.clock.elapsedTime * .22 + phase;
		const r = 3.2 + seed % 3 * .7;
		const x = Math.cos(t) * r + (seed - 2) * .4;
		const z = Math.sin(t) * r * .72;
		const y = WATER_Y + .12 + Math.sin(t * 3) * .03;
		if (!ref.current) return;
		ref.current.position.set(x, y, z);
		ref.current.rotation.y = t + Math.PI / 2;
		movers[`duck-${seed}`] = {
			x,
			z,
			label: "A mallard paddles by"
		};
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		ref,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				scale: [
					.34,
					.2,
					.22
				],
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					1,
					8,
					6
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: seed % 2 ? "#c8b06a" : "#3d4a38" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.16,
					.16
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					.12,
					6,
					5
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#1e241c" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.14,
					.26
				],
				rotation: [
					Math.PI / 2,
					0,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [
					.04,
					.12,
					5
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#d98a3a" })]
			})
		]
	});
}
function Rabbit({ seed }) {
	const ref = (0, import_react.useRef)(null);
	const anchors = (0, import_react.useMemo)(() => [
		[16, 8],
		[-8, 18],
		[12, -8],
		[-17, 8]
	][seed], [seed]);
	useFrame((state) => {
		const t = state.clock.elapsedTime * .55 + seed * 2;
		const hop = Math.abs(Math.sin(t * 2.4));
		const moving = Math.sin(t * .4) > .15;
		const a = t * .35;
		const x = anchors[0] + Math.cos(a) * 2.2;
		const z = anchors[1] + Math.sin(a) * 1.6;
		const y = sampleHeight(x, z) + (moving ? hop * .28 : .08);
		if (!ref.current) return;
		ref.current.position.set(x, y, z);
		ref.current.rotation.y = a + Math.PI / 2;
		movers[`rabbit-${seed}`] = {
			x,
			z,
			label: "A rabbit pauses in the grass"
		};
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		ref,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			scale: [
				.18,
				.14,
				.24
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
				1,
				7,
				5
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#d9cbb8" })]
		}), [-.06, .06].map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				e,
				.2,
				.02
			],
			rotation: [
				.2,
				0,
				e * 2
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
				.03,
				.16,
				2,
				5
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#cbb8a4" })]
		}, e))]
	});
}
function Deer({ seed, anchor }) {
	const ref = (0, import_react.useRef)(null);
	const head = (0, import_react.useRef)(null);
	useFrame((state) => {
		const t = state.clock.elapsedTime * .18 + seed * 3;
		const graze = Math.sin(t * 1.4) > .35;
		const x = anchor[0] + Math.cos(t) * 2.4;
		const z = anchor[1] + Math.sin(t * .8) * 1.8;
		const y = sampleHeight(x, z);
		if (!ref.current) return;
		ref.current.position.set(x, y, z);
		ref.current.rotation.y = t + .4;
		if (head.current) head.current.rotation.x = graze ? .7 : .1;
		movers[`deer-${seed}`] = {
			x,
			z,
			label: "A deer grazes under the pines"
		};
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		ref,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.85,
					0
				],
				scale: [
					.28,
					.4,
					.7
				],
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					1,
					7,
					5
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#8a623c" })]
			}),
			[
				[-.14, .22],
				[.14, .22],
				[-.14, -.22],
				[.14, -.22]
			].map(([lx, lz], i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					lx,
					.32,
					lz
				],
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
					.045,
					.05,
					.64,
					5
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#6a4a2c" })]
			}, i)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
				ref: head,
				position: [
					0,
					1.15,
					.42
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					scale: [
						.16,
						.18,
						.28
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
						1,
						6,
						5
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#7a562e" })]
				}), [-.08, .08].map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						a,
						.22,
						-.04
					],
					rotation: [
						.2,
						0,
						a * 1.4
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
						.012,
						.02,
						.28,
						4
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#d8c8b0" })]
				}, a))]
			})
		]
	});
}
function Fox() {
	const ref = (0, import_react.useRef)(null);
	useFrame((state) => {
		const t = state.clock.elapsedTime * .16;
		const x = Math.cos(t) * PATH_R;
		const z = Math.sin(t) * PATH_R;
		const y = sampleHeight(x, z) + .08;
		if (!ref.current) return;
		ref.current.position.set(x, y, z);
		ref.current.rotation.y = t + Math.PI / 2;
		movers.fox = {
			x,
			z,
			label: "A fox trots the garden path"
		};
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		ref,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.32,
					0
				],
				scale: [
					.18,
					.16,
					.42
				],
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					1,
					7,
					5
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#c36a32" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.42,
					.28
				],
				scale: [
					.12,
					.12,
					.16
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					1,
					6,
					5
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#c36a32" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.38,
					-.4
				],
				rotation: [
					.4,
					0,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [
					.08,
					.36,
					5
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#d8c8b4" })]
			})
		]
	});
}
function Bird({ seed }) {
	const ref = (0, import_react.useRef)(null);
	const wingL = (0, import_react.useRef)(null);
	const wingR = (0, import_react.useRef)(null);
	useFrame((state) => {
		const t = state.clock.elapsedTime;
		const a = t * .28 + seed * .7;
		const x = Math.cos(a) * (16 + seed) + Math.sin(a * 2.1) * 2;
		const z = Math.sin(a) * (11 + seed * .4);
		const y = 7.5 + Math.sin(a * 2 + seed) * 1.4 + seed * .2;
		if (!ref.current) return;
		ref.current.position.set(x, y, z);
		const look = lookTmp.set(x - Math.sin(a) * 4, y, z + Math.cos(a) * 4);
		ref.current.lookAt(look);
		const flap = Math.sin(t * 11 + seed) * .55;
		if (wingL.current) wingL.current.rotation.z = .35 + flap;
		if (wingR.current) wingR.current.rotation.z = -.35 - flap;
	});
	const color = seed % 3 === 0 ? "#2c3038" : seed % 3 === 1 ? "#4a5c6a" : "#6a5340";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		ref,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				scale: [
					.14,
					.1,
					.28
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					1,
					6,
					5
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				ref: wingL,
				position: [
					-.16,
					0,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.42,
					.03,
					.18
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				ref: wingR,
				position: [
					.16,
					0,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.42,
					.03,
					.18
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color })]
			})
		]
	});
}
function Butterfly({ seed }) {
	const ref = (0, import_react.useRef)(null);
	const l = (0, import_react.useRef)(null);
	const r = (0, import_react.useRef)(null);
	const beds = [
		[18.5, 6.5],
		[-6.5, 17.4],
		[-18.2, 4.8],
		[6.4, -16.5],
		[4.8, 24.2],
		[-13.5, -6.4],
		[2, 8]
	];
	const home = beds[seed % beds.length];
	useFrame((state) => {
		const t = state.clock.elapsedTime * .7 + seed;
		const x = home[0] + Math.sin(t) * 1.6;
		const z = home[1] + Math.cos(t * 1.3) * 1.2;
		const y = sampleHeight(x, z) + .9 + Math.sin(t * 2.2) * .35;
		if (!ref.current) return;
		ref.current.position.set(x, y, z);
		ref.current.rotation.y = t;
		const flap = Math.sin(t * 14) * .7;
		if (l.current) l.current.rotation.z = flap;
		if (r.current) r.current.rotation.z = -flap;
	});
	const color = seed % 2 ? "#d9c46a" : "#c46a7a";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		ref,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			ref: l,
			position: [
				-.07,
				0,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [.16, .12] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color,
				side: 2
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			ref: r,
			position: [
				.07,
				0,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [.16, .12] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color,
				side: 2
			})]
		})]
	});
}
function makeTerrain() {
	const size = 160;
	const seg = 112;
	const geo = new PlaneGeometry(size, size, seg, seg);
	geo.rotateX(-Math.PI / 2);
	const pos = geo.attributes.position;
	const colors = new Float32Array(pos.count * 3);
	const c = new Color();
	const rock = new Color("#6a7064");
	for (let i = 0; i < pos.count; i++) {
		const x = pos.getX(i);
		const z = pos.getZ(i);
		const y = sampleHeight(x, z);
		pos.setY(i, y);
		const ld = lakeMetric(x, z);
		const n = fbm(x * .11, z * .11);
		const r = Math.hypot(x, z);
		if (y < -.19) c.setRGB(.34 + n * .08, .4, .3);
		else if (ld < 1.2) c.setRGB(.78 + n * .06, .7, .5);
		else if (isPath(x, z)) c.setRGB(.52 + n * .06, .4, .26);
		else {
			c.setRGB(.2 + n * .1, .36 + n * .2, .16 + n * .06);
			if (r > 36) c.lerp(rock, Math.min(1, (r - 36) / 22));
		}
		colors[i * 3] = c.r;
		colors[i * 3 + 1] = c.g;
		colors[i * 3 + 2] = c.b;
	}
	geo.setAttribute("color", new BufferAttribute(colors, 3));
	geo.computeVertexNormals();
	return geo;
}
var waterVert = `
  varying vec3 vWorld;
  uniform float uTime;
  void main() {
    vec3 p = position;
    p.y += sin(p.x * 0.42 + uTime * 1.25) * 0.07 + cos(p.z * 0.36 + uTime * 0.95) * 0.05;
    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;
var waterFrag = `
  varying vec3 vWorld;
  uniform float uTime;
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  void main() {
    vec3 viewd = normalize(cameraPosition - vWorld);
    vec3 n = normalize(vec3(
      sin(vWorld.x * 0.5 + uTime * 1.25) * 0.22,
      1.0,
      cos(vWorld.z * 0.45 + uTime * 0.95) * 0.22
    ));
    float fres = pow(1.0 - clamp(dot(n, viewd), 0.0, 1.0), 2.6);
    vec3 col = mix(uDeep, uShallow, fres);
    float spec = pow(max(dot(n, normalize(viewd + vec3(0.35, 0.8, 0.2))), 0.0), 40.0);
    col += spec * vec3(0.9, 0.95, 0.85) * 0.5;
    float spark = sin(vWorld.x * 2.8 + uTime * 1.8) * sin(vWorld.z * 3.1 + uTime * 1.4);
    col += vec3(0.12, 0.18, 0.16) * max(spark, 0.0) * 0.28;
    gl_FragColor = vec4(col, 0.9);
  }
`;
function WorldGround() {
	const terrain = (0, import_react.useMemo)(() => makeTerrain(), []);
	const waterMat = (0, import_react.useMemo)(() => new ShaderMaterial({
		uniforms: {
			uTime: { value: 0 },
			uDeep: { value: new Color("#143844") },
			uShallow: { value: new Color("#4ea0a4") }
		},
		vertexShader: waterVert,
		fragmentShader: waterFrag,
		transparent: true,
		depthWrite: false
	}), []);
	const waterGeo = (0, import_react.useMemo)(() => {
		const g = new PlaneGeometry(LAKE_RX * 2.12, LAKE_RZ * 2.12, 48, 36);
		g.rotateX(-Math.PI / 2);
		return g;
	}, []);
	useFrame((state) => {
		waterMat.uniforms.uTime.value = state.clock.elapsedTime;
	});
	(0, import_react.useEffect)(() => () => {
		terrain.dispose();
		waterGeo.dispose();
		waterMat.dispose();
	}, [
		terrain,
		waterGeo,
		waterMat
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
			geometry: terrain,
			receiveShadow: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				vertexColors: true,
				roughness: .92,
				metalness: .02
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
			geometry: waterGeo,
			position: [
				0,
				WATER_Y,
				0
			],
			material: waterMat
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LilyPads, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cattails, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DistantHills, {})
	] });
}
function LilyPads() {
	const pads = (0, import_react.useMemo)(() => [
		[
			2.4,
			1.8,
			.55,
			.4
		],
		[
			-3.1,
			.6,
			.7,
			1.1
		],
		[
			1.2,
			-2.8,
			.48,
			2.2
		],
		[
			-1.6,
			-1.4,
			.62,
			.8
		],
		[
			4.2,
			-.9,
			.42,
			1.7
		],
		[
			-4.4,
			2.2,
			.5,
			2.6
		],
		[
			.4,
			3.4,
			.38,
			.2
		]
	], []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { children: pads.map(([x, z, s, ph], i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			x,
			WATER_Y + .03,
			z
		],
		rotation: [
			-Math.PI / 2,
			0,
			ph
		],
		scale: s,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circleGeometry", { args: [1, 7] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: i % 2 ? "#3d7a45" : "#2f6a3a",
			roughness: .7
		})]
	}, i)) });
}
function Cattails() {
	const stems = (0, import_react.useMemo)(() => [
		[10.2, 2.4],
		[10.6, 3.1],
		[9.7, 3.6],
		[-10.4, 1.8],
		[-10.8, 2.6],
		[3.8, 7.6],
		[4.4, 7.9],
		[-5.6, 7.2]
	], []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { children: stems.map(([x, z], i) => {
		const y = sampleHeight(x, z);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
			position: [
				x,
				y,
				z
			],
			rotation: [
				0,
				i,
				.08
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.7,
					0
				],
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
					.03,
					.04,
					1.4,
					5
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#5c6b3a" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					1.42,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
					.06,
					.05,
					.22,
					6
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#4a3024" })]
			})]
		}, i);
	}) });
}
function DistantHills() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { children: HILLS.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			h.x,
			h.h * .18,
			h.z
		],
		scale: [
			h.s,
			h.h * .42,
			h.s * .82
		],
		castShadow: true,
		receiveShadow: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
			1,
			9,
			6
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: i % 2 ? "#5a6750" : "#4e5c48",
			roughness: .96,
			flatShading: true
		})]
	}, i)) });
}
function GardenCanvas() {
	const playing = useGardenStore((s) => s.playing);
	const cameraMode = useGardenStore((s) => s.cameraMode);
	const orbit = playing && cameraMode === "orbit";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Canvas, {
		shadows: { type: 1 },
		dpr: [1, 1.6],
		camera: {
			fov: 50,
			near: .12,
			far: 180,
			position: [
				22,
				13,
				26
			]
		},
		gl: {
			antialias: true,
			alpha: false,
			powerPreference: "high-performance",
			toneMapping: 4
		},
		onCreated: ({ gl }) => {
			gl.shadowMap.enabled = true;
			gl.shadowMap.type = 1;
		},
		style: {
			touchAction: "none",
			width: "100%",
			height: "100%"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkyAtmosphere, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorldGround, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Vegetation, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Structures, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wildlife, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Player, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CameraDirector, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrbitControls, {
				enabled: orbit,
				enablePan: false,
				maxPolarAngle: Math.PI / 2 - .08,
				minDistance: 8,
				maxDistance: 48,
				target: [
					0,
					.6,
					0
				]
			})
		]
	});
}
//#endregion
export { GardenCanvas as default };
