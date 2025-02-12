<script>
	// @ts-nocheck

	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	export let isOnline = false;

	onMount(() => {
		dispatch('gameMounted');
	});
	let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

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
		},
		won: {
			fill: '#7A91DD',
			stroke: '#5A6CA7'
		}
	};
	let isSelected = false;
	let lastMove = {};
	let selectedPiece;
	let moves = 0;
	export let moveLog = [];
	let turn = {
		side: 'white'
	};
	let playerSide;
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
	export function pieceClick(piece, fromCloud) {
		if (gameState == 'end') {
			return;
		}
		if (piece.side != turn.side || isOnline && (turn.side != playerSide && !fromCloud)) {
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

	export function pieceMove(piece, move) {
		let pieceRef = getPieceIndex(piece);
		pieces[pieceRef] = move;
		movePositions = [];
		lastMove = {
			from: {
				ring: piece.ring,
				segment: segmentFix(piece.segment, piece.ring)
			},
			to: {
				ring: move.ring,
				segment: segmentFix(move.segment, move.ring)
			}
		};
		moveLog.push(lastMove);
		moveLog = moveLog;
		moves++;
		if (turn.side == 'white') {
			turn.side = 'black';
		} else {
			turn.side = 'white';
		}
		let won = checkWin(pieces[pieceRef]);
		if (won) {
			console.log(piece.side + ' won!');
			console.log(won);
			won.forEach((winPiece) => {
				pieces[getPieceIndex(winPiece)].side = 'won';
				console.log(pieces[getPieceIndex(winPiece)]);
			});
			gameState = 'end';
		}
		dispatch('moveMade');
	}

	function checkWin(piece) {
		if (piece.ring == 3) {
			return false;
		}

		let surroundingPieces = [
			getPiece(piece.ring, piece.segment - 3),
			getPiece(piece.ring, piece.segment - 2),
			getPiece(piece.ring, piece.segment - 1),
			getPiece(piece.ring, piece.segment + 1),
			getPiece(piece.ring, piece.segment + 2),
			getPiece(piece.ring, piece.segment + 3)
		];

		if (
			surroundingPieces[1]?.side == surroundingPieces[2]?.side &&
			surroundingPieces[2]?.side == surroundingPieces[3]?.side &&
			surroundingPieces[3]?.side == piece.side
		) {
			return [surroundingPieces[1], surroundingPieces[2], surroundingPieces[3], piece];
		}
		if (
			surroundingPieces[2]?.side == surroundingPieces[3]?.side &&
			surroundingPieces[3]?.side == surroundingPieces[4]?.side &&
			surroundingPieces[4]?.side == piece.side
		) {
			return [surroundingPieces[2], surroundingPieces[3], surroundingPieces[4], piece];
		}
		if (
			surroundingPieces[0]?.side == surroundingPieces[1]?.side &&
			surroundingPieces[1]?.side == surroundingPieces[2]?.side &&
			surroundingPieces[2]?.side == piece.side
		) {
			return [surroundingPieces[0], surroundingPieces[1], surroundingPieces[2], piece];
		}
		if (
			surroundingPieces[3]?.side == surroundingPieces[4]?.side &&
			surroundingPieces[4]?.side == surroundingPieces[5]?.side &&
			surroundingPieces[5]?.side == piece.side
		) {
			return [surroundingPieces[3], surroundingPieces[4], surroundingPieces[5], piece];
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
		let state = { moves: moves, rotations: Math.floor(moves / 6) };
		rings.forEach((ring, rIndex) => {
			let ringRef = [];
			for (let i = 0; i < ring.segments; i++) {
				let piece = getPiece(rIndex, i);
				switch (piece?.side) {
					case 'black':
						ringRef.push(-1);
						break;
					case 'white':
						ringRef.push(1);
						break;
					case 'won':
						ringRef.push(2);
						break;
					default:
						ringRef.push(0);
						break;
				}
			}
			state[rIndex] = ringRef;
		});
		return state;
	}
	let whiteTime = 60000;
	let blackTime = 60000;
	let whiteDeadline = Date.now() + whiteTime;
	let blackDeadline = Date.now() + blackTime;
	$: if (isOnline) {
		setInterval(() => {
			let now = Date.now();
			if (turn.side == 'white') {
				whiteTime = whiteDeadline - Date.now();
			} else {
				blackTime = blackDeadline - Date.now();
			}
			dispatch('timerUpdate');
		}, 100);
	}
	export const game = {
		setPlayerSide(side) {
			playerSide = side;
		},
		getPlayerSide() {
			return playerSide;
		},
		getState() {
			return getGameState();
		},
		setState(state) {
			if (state == null) {
				return;
			}
			pieces = [];
			for (let ringI = 0; ringI < 4; ringI++) {
				for (let i = 0; i < state[ringI].length; i++) {
					let side;
					if (state[ringI][i] == 1) {
						side = 'white';
					} else {
						if (state[ringI][i] == -1) {
							side = 'black';
						} else if (state[ringI][i] == 2) {
							side = "won";
						} else {
							side = null;
						}
					}
					if (side != null) {
						pieces.push({
							ring: ringI,
							segment: i,
							side: side
						});
					}
				}
			}

			rotationTriggered = true;
			moves = state.moves;

			setTimeout(() => {
				rotationTriggered = false;
			}, 500);

			for (let i = 0; i < state.rotations; i++) {
				rotation = [
					rotation[0], // Outer ring stays still
					rotation[1] + Math.PI / 6, // Middle ring rotates
					rotation[2] - Math.PI / 3 // Inner ring rotates
				];
			}
			if (moves % 6 == 0) {
				rotation = [
					rotation[0], // Outer ring stays still
					rotation[1] - Math.PI / 6, // Middle ring rotates
					rotation[2] + Math.PI / 3 // Inner ring rotates
				];
			}
			if (moves % 2 == 0) {
				turn.side = 'white';
			} else {
				turn.side = 'black';
			}
			console.log(pieces, moves, turn, state.rotations);
		},
		white: {
			getState() {},
			getMoves(gameState) {},
			getTime() {
				return whiteTime;
			},
			getDeadline() {
				return whiteDeadline;
			},
			setDeadline(deadline) {
				whiteDeadline = deadline;
			},
			setTime(time) {
				whiteTime = time;
			}
		},
		black: {
			getState() {},
			getMoves(gameState) {},
			getTime() {
				return blackTime;
			},
			getDeadline() {
				return blackDeadline;
			},
			setDeadline(deadline) {
				blackDeadline = deadline;
			},
			setTime(time) {
				blackTime = time;
			}
		},
		move: {
			run(moveId) {
				let target = getPiece(moveId.from.ring, moveId.from.segment);
				console.log('moving piece', target);

				if (target == null) {
					console.error('Unknown piece at ' + moveId.from.ring + ', ' + moveId.from.segment);
				} else {
					pieceClick(target, true);
					console.log(target, movePositions, turn.side, playerSide);
					if (
						!movePositions?.some(
							(obj) =>
								obj.ring === moveId.to.ring &&
								obj.segment === segmentFix(moveId.to.segment, moveId.to.ring)
						)
					) {
						console.error('bad move; not in move positions');
					} else {
						pieceMove(selectedPiece, {
							ring: moveId.to.ring,
							segment: segmentFix(moveId.to.segment, moveId.to.ring),
							side: selectedPiece.side
						});
					}
				}
			},
			new(fromRing, fromSegment, toRing, toSegment) {
				return {
					from: { ring: fromRing, segment: fromSegment },
					to: { ring: toRing, segment: toSegment }
				};
			},
			last() {
				return lastMove;
			},
			getAll() {
				return moveLog;
			},
			count() {
				return moves;
			}
		}
	};
</script>

<svg width="360" height="360" class="shadow">
	<!-- Draw smooth circular ring segments -->
	{#each rings as ring, rIndex}
		{#each Array(ring.segments).fill(0) as _, i}
			{#key `${rIndex}-${i}`}
				<path
					d={getSegmentPath(ring, i, ring.segments, isSafari ? 0 : rotation[rIndex])}
					class="duration-500 fill-accent-light stroke-accent"
					style="transform-origin: center; transform: rotate({isSafari ? rotation[rIndex] : 0}rad);"
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
