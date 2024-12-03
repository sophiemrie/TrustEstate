import fs from 'fs';
import path from 'path';

var destination = './src/contracts';

const artifacts = [
  './src/assets/contracts/TrustEstate.json',
];

(async function () {
	for (const artifact of artifacts) {
		let content;
		try {
			//try to import from node_modules
			content = JSON.stringify(await import(artifact));
		} catch (e) {
			//try to read as path on disc
			content = fs.readFileSync(artifact, 'utf-8');
		}
		const filename = path.basename(artifact, '.json');
		//create and write typescript file
		fs.writeFileSync(
			path.join(destination, filename + '.ts'),
			`const artifact = ${content.trimEnd()} as const; export default artifact;`,
		);
	}
})();
