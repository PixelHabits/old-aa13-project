import { expect } from 'chai';
import { before, describe, it } from 'mocha';
import {
	agentCreateSpot,
	agentCreateSpotImage,
	agentSignUp,
	createManyAgents,
	fetchManyCsrfTokens,
} from '../utils/agent-factory.mjs';
import { createUniqueSpot } from '../utils/agent-helpers.mjs';
import { apiBaseUrl } from '../utils/constants.mjs';
import { expectedNeOrEditSpotKeys } from '../utils/err-helpers.mjs';

describe('\nEdit a Spot', () => {
	let agent;
	let xsrfToken;
	let agentSpot;
	let agent2;
	let xsrfToken2;
	let agentNonAuth;
	let xsrfToken3;

	before(async function () {
		this.timeout(15000);
		[agent, agent2, agentNonAuth] = createManyAgents(apiBaseUrl, 3);
		[xsrfToken, xsrfToken2, xsrfToken3] = await fetchManyCsrfTokens([
			agent,
			agent2,
			agentNonAuth,
		]);
		await agentSignUp(agent, xsrfToken);
		await agentSignUp(agent2, xsrfToken2);
		const res = await agentCreateSpot(agent, xsrfToken);
		agentSpot = res.body;
		const imageRes = await agentCreateSpotImage(agent, xsrfToken, agentSpot.id);
		agent.image = imageRes;
	});

	describe('PUT /api/spots/:spotId', () => {
		it('Correct Endpoint', (done) => {
			const validSpotId = agentSpot.id;
			const spotData = createUniqueSpot();
			agent
				.put(`/spots/${validSpotId}`)
				.send(spotData)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect('Content-Type', /json/)
				.end((err, _res) => {
					expect(err).to.not.exist;
					done();
				});
		});

		it('Authentication', (done) => {
			const spotData = createUniqueSpot();
			const validSpotId = agentSpot.id;
			agentNonAuth
				.put(`/spots/${validSpotId}`)
				.send(spotData)
				.set('X-XSRF-TOKEN', xsrfToken3)
				.set('Accept', 'application/json')
				.expect(401)
				.end((err, _res) => {
					if (err) return done(err);
					done();
				});
		});

		it('Authorization', (done) => {
			const spotData = createUniqueSpot();
			const validSpotId = agentSpot.id;
			agent2
				.put(`/spots/${validSpotId}`)
				.send(spotData)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken2)
				.expect(403)
				.end((err, _res) => {
					if (err) return done(err);
					done();
				});
		});
	});

	describe('Response', () => {
		it('Status Code - 200', (done) => {
			const validSpotId = agentSpot.id;
			const spotData = createUniqueSpot();
			agent
				.put(`/spots/${validSpotId}`)
				.send(spotData)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect('Content-Type', /json/)
				.expect(200)
				.end((_err, _res) => {
					done();
				});
		});

		it('Body Matches Api Docs', (done) => {
			const validSpotId = agentSpot.id;
			const spotData = createUniqueSpot();
			agent
				.put(`/spots/${validSpotId}`)
				.send(spotData)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect('Content-Type', /json/)
				.expect(200)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.include.keys(expectedNeOrEditSpotKeys);
					expect(res.body.name).to.equal(spotData.name);
					expect(res.body.address).to.equal(spotData.address);
					done();
				});
		});
	});

	describe('Error Response: Body validation error', () => {
		it('Status Code - 400', (done) => {
			const incompleteData = {
				city: 'San Francisco',
			};
			const validSpotId = agentSpot.id;
			agent
				.put(`/spots/${validSpotId}`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.send(incompleteData)
				.expect('Content-Type', /json/)
				.expect(400)
				.end((err, _res) => {
					expect(err).to.not.exist;
					done();
				});
		});
		it('Body Matches API Docs', (done) => {
			const incompleteData = {
				city: 'San Francisco',
			};
			const validSpotId = agentSpot.id;
			agent
				.put(`/spots/${validSpotId}`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.send(incompleteData)
				.expect('Content-Type', /json/)
				.expect(400)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.have.property('message');
					expect(res.body.errors).to.include.keys(
						'address',
						'lat',
						'lng',
						'name',
						'description',
						'price',
						'country',
						'state',
					);
					done();
				});
		});
	});

	describe("Error response: Couldn't find a Spot with the specified id", () => {
		it('Status Code - 404', (done) => {
			const invalidSpotId = 923058;
			const spotData = createUniqueSpot();
			agent
				.put(`/spots/${invalidSpotId}`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.send(spotData)
				.expect('Content-Type', /json/)
				.expect(404)
				.end((err, _res) => {
					expect(err).to.not.exist;
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			const invalidSpotId = 923058;
			const spotData = createUniqueSpot();
			agent
				.put(`/spots/${invalidSpotId}`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.send(spotData)
				.expect('Content-Type', /json/)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.have.property(
						'message',
						"Spot couldn't be found",
					);
					done();
				});
		});
	});
});
