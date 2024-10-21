import { expect } from 'chai';
import { before, describe, it } from 'mocha';
import {
	agentCreateSpot,
	agentSignUp,
	createManyAgents,
	fetchManyCsrfTokens,
} from '../utils/agent-factory.mjs';
import { apiBaseUrl } from '../utils/constants.mjs';

describe('\nDelete a Spot', () => {
	let agent;
	let xsrfToken;
	let agentSpot;
	let agent2;
	let xsrfToken2;
	let _agent2Spot;
	let agentSpot2;
	let agentSpot3;
	let agentSpot4;
	let agentSpot5;
	let agentSpot6;
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
		const spotForDeleting1 = await agentCreateSpot(agent, xsrfToken);
		const spotForDeleting2 = await agentCreateSpot(agent, xsrfToken);
		const spotForDeleting3 = await agentCreateSpot(agent, xsrfToken);
		const spotForDeleting4 = await agentCreateSpot(agent, xsrfToken);
		const spotForDeleting5 = await agentCreateSpot(agent, xsrfToken);
		agentSpot = res.body;
		agentSpot2 = spotForDeleting1.body;
		agentSpot3 = spotForDeleting2.body;
		agentSpot4 = spotForDeleting3.body;
		agentSpot5 = spotForDeleting4.body;
		agentSpot6 = spotForDeleting5.body;

		const res2 = await agentCreateSpot(agent, xsrfToken, agentSpot.id);
		_agent2Spot = res2.body;
	});

	describe('DELETE /api/spots/:spotId', () => {
		it('Correct Endpoint', (done) => {
			const spotId = agentSpot2.id;
			agent
				.delete(`/spots/${spotId}`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect('Content-Type', /json/)
				.end((_err, _res) => {
					done();
				});
		});
		it('Authentication', (done) => {
			const spotId = agentSpot3.id;
			agentNonAuth
				.delete(`/spots/${spotId}`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken3)
				.expect(401)
				.end((err, _res) => {
					if (err) return done(err);
					done();
				});
		});
		it('Authorization', (done) => {
			const spotId = agentSpot4.id;
			agent2
				.delete(`/spots/${spotId}`)
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
			const spotId = agentSpot5.id;
			agent
				.delete(`/spots/${spotId}`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect('Content-Type', /json/)
				.expect(200)
				.end((_err, _res) => {
					done();
				});
		});

		it('Body Matches Api Docs', (done) => {
			const spotId = agentSpot6.id;
			agent
				.delete(`/spots/${spotId}`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect('Content-Type', /json/)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.have.property('message', 'Successfully deleted');
					done();
				});
		});
	});

	describe('Error Response', () => {
		it('Status Code - 404', (done) => {
			const invalidSpotId = 99325;
			agent
				.delete(`/spots/${invalidSpotId}`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect('Content-Type', /json/)
				.expect(404)
				.end((err, _res) => {
					expect(err).to.not.exist;
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			const invalidSpotId = 99325;
			agent
				.delete(`/spots/${invalidSpotId}`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
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
