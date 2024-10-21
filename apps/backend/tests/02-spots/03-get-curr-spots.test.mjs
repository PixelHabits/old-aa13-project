import { assert, expect } from 'chai';
import { before, describe, it } from 'mocha';
import {
	agentCreateSpot,
	agentCreateSpotImage,
	agentSignUp,
	createManyAgents,
	fetchManyCsrfTokens,
} from '../utils/agent-factory.mjs';
import { apiBaseUrl } from '../utils/constants.mjs';
import { expectedSpotKeys } from '../utils/err-helpers.mjs';

describe('\nGet all Spots owned by the Current User', () => {
	let agent;
	let xsrfToken;
	let agentSpot;
	let _agentImage;
	let unAuthAgent;
	let xsrfToken2;

	before(async function () {
		this.timeout(15000);
		[agent, unAuthAgent] = createManyAgents(apiBaseUrl, 2);
		[xsrfToken, xsrfToken2] = await fetchManyCsrfTokens([agent, unAuthAgent]);
		await agentSignUp(agent, xsrfToken);
		const res = await agentCreateSpot(agent, xsrfToken);
		agentSpot = res.body;
		const imageRes = await agentCreateSpotImage(agent, xsrfToken, agentSpot.id);
		_agentImage = imageRes;
	});
	describe('GET /api/spots/current', () => {
		it('Correct Endpoint', (done) => {
			agent.get('/spots/current').end((err, _res) => {
				expect(err).to.not.exist;
				done();
			});
		});

		it('Authentication', (done) => {
			unAuthAgent
				.get('/spots/current')
				.set('X-XSRF-TOKEN', xsrfToken2)
				.expect(401)
				.end((err, _res) => {
					if (err) return done(err);
					done();
				});
		});
	});

	describe('Response', () => {
		it('Status Code - 200', (done) => {
			agent
				.get('/spots/current')
				.expect(200)
				.end((err, _res) => {
					expect(err).to.not.exist;
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			agent
				.get('/spots/current')
				.expect(200)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('Spots').that.is.an('array');

					const { Spots } = res.body;

					if (Spots.length > 0) {
						const spot = Spots[0];
						expect(spot).to.include.all.keys(expectedSpotKeys);
						expect(spot.ownerId).to.be.a('number');
						expect(spot.address).to.be.a('string');

						const {
							id,
							ownerId,
							address,
							city,
							state,
							country,
							lat,
							lng,
							name,
							description,
							price,
						} = agentSpot;

						assert.strictEqual(spot.id, id);
						assert.strictEqual(spot.ownerId, ownerId);
						assert.strictEqual(spot.address, address);
						assert.strictEqual(spot.city, city);
						assert.strictEqual(spot.state, state);
						assert.strictEqual(spot.country, country);
						assert.strictEqual(spot.lat, lat);
						assert.strictEqual(spot.lng, lng);
						assert.strictEqual(spot.name, name);
						assert.strictEqual(spot.description, description);
						assert.strictEqual(spot.price, price);
						expect(spot).to.have.property('createdAt');
						expect(spot).to.have.property('updatedAt');
					}

					done();
				});
		});
	});
});
