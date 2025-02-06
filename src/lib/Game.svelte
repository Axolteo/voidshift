<script>
	// @ts-nocheck

	import { onMount } from 'svelte';

	const centerX = 180,
		centerY = 180;
	const rings = [
		{ radius: 180, innerRadius: 180 * 0.8, segments: 24 }, // Outer Ring
		{ radius: 180 * 0.8, innerRadius: 180 * 0.8 * 0.72, segments: 12 }, // Middle Ring
		{ radius: 180 * 0.8 * 0.72, innerRadius: 180 * 0.8 * 0.72 * 0.64, segments: 6 }, // Inner Ring
		{ radius: 180 * 0.8 * 0.72 * 0.64 * 0.5, innerRadius: 0, segments: 1 }
	];
	let rotation = [0, 0, 0]; // Rotation per ring

	// Define pieces (positioned by segment index & ring index)
	let pieces = [
		{ ring: 0, segment: 8, side: 'white' },
		{ ring: 0, segment: 9, side: 'black' },
		{ ring: 0, segment: 10, side: 'white' },
		{ ring: 0, segment: 11, side: 'black' },
		{ ring: 0, segment: 12, side: 'white' },
		{ ring: 0, segment: 13, side: 'black' },
		{ ring: 0, segment: 14, side: 'white' },
		{ ring: 0, segment: 15, side: 'black' },
		{ ring: 0, segment: 20, side: 'white' },
		{ ring: 0, segment: 21, side: 'black' },
		{ ring: 0, segment: 22, side: 'white' },
		{ ring: 0, segment: 23, side: 'black' },
		{ ring: 0, segment: 0, side: 'white' },
		{ ring: 0, segment: 1, side: 'black' },
		{ ring: 0, segment: 2, side: 'white' },
		{ ring: 0, segment: 3, side: 'black' }
	];

	let pieceData = {
		black: {
			fill: '#1b1b1b',
			stroke: '#494949'
		},
		white: {
			fill: '#FFFFFF',
			stroke: '#e7e7e7'
		}
	};
	let isSelected = false;
	let selectedPiece;
	let moves = 0;
	export let moveLog = [];
	let turn = {
		side: 'white'
	};
	let gameState = 'play';
	let movePositions;

	// Get the center of a segment to place a piece
	/**
	 * @param {string | number} ring
	 * @param {number} segment
	 */
	function getPiecePosition(ring, segment) {
		const ringData = rings[ring];
		if (ringData.innerRadius > 0) {
			const angle = (Math.PI * (segment + (segment + 1))) / ringData.segments + rotation[ring];
			const radius = (ringData.radius + ringData.innerRadius) / 2; // Midpoint of the segment
			return polarToCartesian(radius, angle);
		} else {
			return { x: centerX, y: centerY };
		}
	}

	// Function to generate a curved trapezoidal segment
	/**
	 * @param {{ radius: any; innerRadius: any; segments?: number; }} ring
	 * @param {number} index
	 * @param {number} total
	 * @param {number} rotationOffset
	 */
	function getSegmentPath(ring, index, total, rotationOffset) {
		if (ring.innerRadius > 0) {
			const angle1 = (2 * Math.PI * index) / total + rotationOffset;
			const angle2 = (2 * Math.PI * (index + 1)) / total + rotationOffset;

			const outer1 = polarToCartesian(ring.radius, angle1);
			const outer2 = polarToCartesian(ring.radius, angle2);
			const inner1 = polarToCartesian(ring.innerRadius, angle1);
			const inner2 = polarToCartesian(ring.innerRadius, angle2);

			return `
        M ${inner1.x} ${inner1.y}
        A ${ring.innerRadius} ${ring.innerRadius} 0 0 1 ${inner2.x} ${inner2.y}
        L ${outer2.x} ${outer2.y}
        A ${ring.radius} ${ring.radius} 0 0 0 ${outer1.x} ${outer1.y}
        Z
      `;
		}
	}

	// Convert polar coordinates to cartesian (x, y)
	/**
	 * @param {number} radius
	 * @param {number} angle
	 */
	function polarToCartesian(radius, angle) {
		return {
			x: centerX + radius * Math.cos(angle),
			y: centerY + radius * Math.sin(angle)
		};
	}

	let timeoutId;
	let rotationTriggered = false; // Prevents repeated timeouts

	$: {
		if (moves % 6 === 0 && moves > 0 && !rotationTriggered) {
			rotationTriggered = true;

			timeoutId = setTimeout(() => {
				rotation = [
					rotation[0], // Outer ring stays still
					rotation[1] + Math.PI / 6, // Middle ring rotates
					rotation[2] - Math.PI / 3 // Inner ring rotates
				];
			}, 500);
		}

		if (moves % 6 !== 0 || moves == 0) {
			rotationTriggered = false;
		}
	}
	function pieceClick(piece) {
		if (gameState == 'end') {
			return;
		}
		if (piece.side != turn.side) {
			return;
		}
		isSelected = true;
		selectedPiece = piece;
		movePositions = [];
		switch (selectedPiece.ring) {
			case 0:
				addMovePosition(0, selectedPiece.segment + 1);
				addMovePosition(0, selectedPiece.segment - 1);
				addMovePosition(1, Math.floor(selectedPiece.segment / 2) - Math.floor(moves / 6));
				break;
			case 1:
				addMovePosition(0, (selectedPiece.segment + Math.floor(moves / 6)) * 2);
				addMovePosition(0, (selectedPiece.segment + Math.floor(moves / 6)) * 2 + 1);
				addMovePosition(1, selectedPiece.segment + 1);
				addMovePosition(1, selectedPiece.segment - 1);
				addMovePosition(
					2,
					Math.floor((selectedPiece.segment + Math.floor(moves / 6)) / 2) + Math.floor(moves / 6)
				);
				break;
			case 2:
				addMovePosition(
					1,
					(selectedPiece.segment - Math.floor(moves / 6)) * 2 + 1 - Math.floor(moves / 6)
				);
				addMovePosition(
					1,
					(selectedPiece.segment - Math.floor(moves / 6)) * 2 - Math.floor(moves / 6)
				);
				addMovePosition(2, selectedPiece.segment + 1);
				addMovePosition(2, selectedPiece.segment - 1);
				addMovePosition(3, 0);
				break;
			case 3:
				addMovePosition(2, 0);
				addMovePosition(2, 1);
				addMovePosition(2, 2);
				addMovePosition(2, 3);
				addMovePosition(2, 4);
				addMovePosition(2, 5);
				break;
		}
	}

	function pieceMove(piece, move) {
		let pieceRef = getPieceIndex(piece);
		pieces[pieceRef] = move;
		movePositions = [];
		moveLog.push({
			from: {
				ring: piece.ring,
				segment: segmentFix(piece.segment, piece.ring)
			},
			to: {
				ring: move.ring,
				segment: segmentFix(move.segment, move.ring)
			}
		});
		moveLog = moveLog;
		moves++;
		if (turn.side == 'white') {
			turn.side = 'black';
		} else {
			turn.side = 'white';
		}
		if (checkWin(pieces[pieceRef])) {
			console.log(piece.side + ' won!');
			gameState = 'end';
		}
	}

	function checkWin(piece) {
		if (piece.ring == 3) {
			return false;
		}
		if (
			getPiece(piece.ring, piece.segment - 2)?.side ==
				getPiece(piece.ring, piece.segment - 1)?.side &&
			getPiece(piece.ring, piece.segment - 1)?.side ==
				getPiece(piece.ring, piece.segment + 1)?.side &&
			getPiece(piece.ring, piece.segment + 1)?.side == piece.side
		) {
			return true;
		}
		if (
			getPiece(piece.ring, piece.segment - 1)?.side ==
				getPiece(piece.ring, piece.segment + 1)?.side &&
			getPiece(piece.ring, piece.segment + 1)?.side ==
				getPiece(piece.ring, piece.segment + 2)?.side &&
			getPiece(piece.ring, piece.segment + 2)?.side == piece.side
		) {
			return true;
		}
		if (
			getPiece(piece.ring, piece.segment - 3)?.side ==
				getPiece(piece.ring, piece.segment - 2)?.side &&
			getPiece(piece.ring, piece.segment - 2)?.side ==
				getPiece(piece.ring, piece.segment - 1)?.side &&
			getPiece(piece.ring, piece.segment - 1)?.side == piece.side
		) {
			return true;
		}
		if (
			getPiece(piece.ring, piece.segment + 1)?.side ==
				getPiece(piece.ring, piece.segment + 2)?.side &&
			getPiece(piece.ring, piece.segment + 2)?.side ==
				getPiece(piece.ring, piece.segment + 3)?.side &&
			getPiece(piece.ring, piece.segment + 3)?.side == piece.side
		) {
			return true;
		}
		return false;
	}

	function getPiece(ring, segment) {
		return pieces[
			pieces.findIndex((obj) => obj.ring === ring && obj.segment === segmentFix(segment, ring))
		];
	}

	function getPieceIndex(piece) {
		return pieces.findIndex(
			(obj) => obj.ring === piece.ring && obj.segment === segmentFix(piece.segment, piece.ring)
		);
	}

	function addMovePosition(ring, segment) {
		if (!pieces.some((obj) => obj.ring === ring && obj.segment === segmentFix(segment, ring))) {
			movePositions.push({ ring: ring, segment: segmentFix(segment, ring) });
		}
	}

	function segmentFix(segment, ring) {
		let toSegment = segment % rings[ring].segments;
		if (toSegment < 0) {
			toSegment += rings[ring].segments;
		}
		return toSegment;
	}

	export function getGameState() {
		let state = [moves % 6];
		rings.forEach((ring, rIndex) => {
			for (let i = 0; i < ring.segments; i++) {
				let piece = getPiece(rIndex, i);
				switch (piece?.side) {
					case 'black':
						state.push(-1);
						break;
					case 'white':
						state.push(1);
						break;
					default:
						state.push(0);
						break;
				}
			}
		});
		return state;
	}
</script>

<svg width="360" height="360" class="shadow">
	<!-- Draw smooth circular ring segments -->
	{#each rings as ring, rIndex}
		{#each Array(ring.segments).fill(0) as _, i}
			{#key `${rIndex}-${i}`}
				<path
					d={getSegmentPath(ring, i, ring.segments, 0)}
					class="duration-500 fill-accent-light stroke-accent"
					style="transform: rotate({rotation[rIndex]*0.3}rad)"
				/>
			{/key}
		{/each}
	{/each}

	<!-- Center space -->
	<circle
		cx={centerX}
		cy={centerY}
		r={180 * 0.8 * 0.72 * 0.64 * 0.5}
		class="fill-accent-light stroke-accent"
	/>

	<!-- Draw game pieces -->
	{#each pieces as piece}
		{#if piece.ring < rings.length}
			<circle
				cx={getPiecePosition(piece.ring, piece.segment).x}
				cy={getPiecePosition(piece.ring, piece.segment).y}
				r="12"
				fill={pieceData[piece.side].fill}
				stroke-width="2"
				stroke={pieceData[piece.side].stroke}
				class="outline-none duration-500"
				style="filter: drop-shadow(0rem 0rem 0.2rem #00000020)"
				on:click={() => pieceClick(piece)}
				on:keydown={() => {}}
				role="button"
				tabindex="-1"
			/>
		{/if}
	{/each}

	{#if isSelected}
		{#each movePositions as position}
			<circle
				cx={getPiecePosition(position.ring, position.segment).x}
				cy={getPiecePosition(position.ring, position.segment).y}
				r="12"
				fill={pieceData[selectedPiece.side].fill}
				stroke-width="2"
				stroke={pieceData[selectedPiece.side].stroke}
				class="opacity-50 outline-none"
				style="filter: drop-shadow(0rem 0rem 0.2rem #00000020)"
				on:click={() =>
					pieceMove(selectedPiece, {
						ring: position.ring,
						segment: segmentFix(position.segment, position.ring),
						side: selectedPiece.side
					})}
				on:keydown={() => {}}
				role="button"
				tabindex="-1"
			/>
		{/each}
	{/if}
</svg>
