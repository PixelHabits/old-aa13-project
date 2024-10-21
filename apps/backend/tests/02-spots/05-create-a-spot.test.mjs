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

describe('\nCreate a Spot', () => {
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
		const res = await agentCreateSpot(agent, xsrfToken);
		agentSpot = res.body;
		const imageRes = await agentCreateSpotImage(agent, xsrfToken, agentSpot.id);
		agent.image = imageRes;
	});

	describe('POST /api/spots', () => {
		it('Correct Endpoint', (done) => {
			const spotData = createUniqueSpot();
			agent2
				.post('/spots')
				.send(spotData)
				.set('X-XSRF-TOKEN', xsrfToken2)
				.set('Accept', 'application/json')
				.end((err, _res) => {
					expect(err).to.not.exist;
					done();
				});
		});

		it('Authentication', (done) => {
			const spotData = createUniqueSpot();
			agentNonAuth
				.post('/spots')
				.set('X-XSRF-TOKEN', xsrfToken3)
				.send(spotData)
				.set('Accept', 'application/json')
				.expect(401)
				.end((err, _res) => {
					if (err) return done(err);
					done();
				});
		});
	});
	describe('Response', () => {
		it('Status Code - 201', (done) => {
			const spotData = createUniqueSpot();
			agent
				.post('/spots')
				.send(spotData)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect(201)
				.end((err, _res) => {
					expect(err).to.not.exist;
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			const spotData = createUniqueSpot();
			agent
				.post('/spots')
				.send(spotData)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect('Content-Type', /json/)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.include.keys(expectedNeOrEditSpotKeys);
					expect(res.body.name).to.equal(spotData.name);
					expect(res.body.address).to.equal(spotData.address);
					done();
				});
		});
	});
	describe('Error Response', () => {
		it('Status Code - 400', (done) => {
			const incompleteData = {
				city: 'San Francisco',
				state: 'California',
				country: 'United States of America',
			};

			agent
				.post('/spots')
				.send(incompleteData)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect(400)
				.end((err, _res) => {
					if (err) return done(err);
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			const incompleteData = {
				city: 'San Francisco',
				state: 'California',
				country: 'United States of America',
			};

			agent
				.post('/spots')
				.send(incompleteData)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.end((err, res) => {
					expect(res.body).to.have.property('message');
					expect(res.body.errors).to.include.all.keys(
						'address',
						'lat',
						'lng',
						'name',
						'description',
						'price',
					);
					if (err) return done(err);
					done();
				});
		});
	});
});
