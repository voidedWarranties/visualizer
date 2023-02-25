function rgbToHex(a) {
    return parseInt(componentToHex(a[0]) + componentToHex(a[1]) + componentToHex(a[2]), 16);
}

const bluePalette = [
    0xffffff,
    0x1098f7,
    0x1b4079,
    0x255c99,
    0x235789,
    0x4a8fe7,
    0x6dc0d5,
    0x0081a7,
    0x1982c4,
    0x337ca0,
    0x247ba0,
];

function getPolygonPoints(sides) {
    const points = [];
    for (let deg = 0; deg < 360; deg += 360 / sides) {
        const angle = deg * Math.PI / 180;
        points.push([Math.cos(angle), Math.sin(angle)]);
    }

    return points;
}

// function getPolygonAngles(offset, sides, projectiles) {
//     const angles = [];
//     const points = getPolygonPoints(sides);

//     const regAngle = 360 / sides;
//     for (let side = 0; side < sides; side++) {
//         const angMin = side * regAngle;
//         const angMax = angMin + regAngle;

//         for (let deg = angMin; deg < angMax; deg += regAngle / Math.floor(projectiles / sides)) {
//             const angle = deg * Math.PI / 180;
//             const point = [Math.cos(angle), Math.sin(angle)];
//             for (let i = 0; i < points.length; i++) {
//                 const intersection = getIntersection([0, 0], point, points[i], points[(i + 1) % points.length]);

//                 if (intersection) {
//                     const [x, y] = intersection;
//                     const xP = x * Math.cos(offset) - y * Math.sin(offset);
//                     const yP = x * Math.sin(offset) + y * Math.cos(offset);

//                     angles.push([xP, yP]);
//                     break;
//                 }
//             }
//         }
//     }

//     return angles;
// }

function getDistance(p1, p2) {
    return Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2);
}

function getPolygonAngles(offset, sides, projectiles) {
    const angles = [];
    const points = getPolygonPoints(sides);

    const sideLen = getDistance(points[0], points[1]);
    const space = sideLen / Math.floor(projectiles / sides);

    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const nextPoint = points[(i + 1) % points.length];

        const angle = Math.atan2(nextPoint[1] - point[1], nextPoint[0] - point[0]);
        const xT = Math.cos(angle) * space;
        const yT = Math.sin(angle) * space;

        for (let j = 0; j < Math.floor(projectiles / sides); j++) {
            const x = point[0] + xT * j;
            const y = point[1] + yT * j;

            const xRot = x * Math.cos(offset) - y * Math.sin(offset);
            const yRot = x * Math.sin(offset) + y * Math.cos(offset);

            angles.push([xRot, yRot]);
        }
    }

    return angles;
}

// p1 and 2 is a ray
// ua: p1,2
// ub: p3,4
function getIntersection(p1, p2, p3, p4) {
    if ((p1[0] === p2[0] && p1[1] === p2[1]) || (p3[0] === p4[0] && p3[1] === p4[1])) {
        return false;
    }

    const denom = (p4[1] - p3[1]) * (p2[0] - p1[0]) - (p4[0] - p3[0]) * (p2[1] - p1[1]);

    if (denom === 0) {
        return false;
    }

    const ua = ((p4[0] - p3[0]) * (p1[1] - p3[1]) - (p4[1] - p3[1]) * (p1[0] - p3[0])) / denom;
    const ub = ((p2[0] - p1[0]) * (p1[1] - p3[1]) - (p2[1] - p1[1]) * (p1[0] - p3[0])) / denom;

    if (ua < 0 || ub < 0 || ub > 1) {
        return false;
    }

    return [
        p1[0] + ua * (p2[0] - p1[0]),
        p1[1] + ua * (p2[1] - p1[1])
    ];
}