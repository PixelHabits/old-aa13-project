import { expect } from 'chai';
import { before, describe, it } from 'mocha';
import {
	agentCreateSpot,
	agentSignUp,
	createManyAgents,
	fetchManyCsrfTokens,
} from '../utils/agent-factory.mjs';
import { createUniqueImage } from '../utils/agent-helpers.mjs';
import { apiBaseUrl } from '../utils/constants.mjs';

describe("\nAdd an Image to a Spot based on the Spot's id", () => {
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
	});

	describe('POST /api/spots/:spotId/images', () => {
		it('Correct Endpoint', (done) => {
			const validSpotId = agentSpot.id;
			const imageData = createUniqueImage();
			agent
				.post(`/spots/${validSpotId}/images`)
				.send(imageData)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect('Content-Type', /json/)
				.end((err, _res) => {
					expect(err).to.not.exist;
					done();
				});
		});

		it('Authentication', (done) => {
			const validSpotId = agentSpot.id;
			const imageData = createUniqueImage();
			agentNonAuth
				.post(`/spots/${validSpotId}/images`)
				.send(imageData)
				.set('X-XSRF-TOKEN', xsrfToken3)
				.set('Accept', 'application/json')
				.expect(401)
				.end((err, _res) => {
					if (err) return done(err);
					done();
				});
		});

		it('Authorization', (done) => {
			const validSpotId = agentSpot.id;
			const imageData = createUniqueImage();
			agent2
				.post(`/spots/${validSpotId}/images`)
				.send(imageData)
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
		it('Status Code - 201', (done) => {
			const validSpotId = agentSpot.id;
			const imageData = createUniqueImage();
			agent
				.post(`/spots/${validSpotId}/images`)
				.send(imageData)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect('Content-Type', /json/)
				.expect(201)
				.end((err, _res) => {
					expect(err).to.not.exist;
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			const validSpotId = agentSpot.id;
			const imageData = createUniqueImage();
			agent
				.post(`/spots/${validSpotId}/images`)
				.send(imageData)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect('Content-Type', /json/)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.include.keys('id', 'url', 'preview');
					expect(res.body.url).to.equal(imageData.url);
					expect(res.body.preview).to.equal(imageData.preview);
					done();
				});
		});
	});

	describe('Error Response', () => {
		it('Status Code - 404', (done) => {
			const imageData = createUniqueImage();
			const invalidSpotId = 99923;
			agent
				.post(`/spots/${invalidSpotId}/images`)
				.send(imageData)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect('Content-Type', /json/)
				.expect(404)
				.end((err, _res) => {
					if (err) return done(err);
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			const nonOwnedSpotId = 1494949949;
			const imageData = createUniqueImage();
			agent
				.post(`/spots/${nonOwnedSpotId}/images`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.send(imageData)
				.expect('Content-Type', /json/)
				.expect(404)
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
