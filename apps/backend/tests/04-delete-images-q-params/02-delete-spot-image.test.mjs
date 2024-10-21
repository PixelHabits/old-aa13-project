import { expect } from 'chai';
import { before, describe, it } from 'mocha';
import {
	agentCreateSpot,
	agentCreateSpotImage,
	agentSignUp,
	createAgent,
	fetchCsrfToken,
} from '../utils/agent-factory.mjs';
import { apiBaseUrl } from '../utils/constants.mjs';

describe('\nDelete a Spot Image', () => {
	let agent;
	let xsrfToken;
	let spot;
	let spotImage;
	let spotImage1;
	let xsrfToken2;
	let agent2;
	let spot2;
	let spotImage2;
	let agent3;
	let xsrfToken3;

	before(async function () {
		this.timeout(15000);
		agent = createAgent(apiBaseUrl);

		xsrfToken = await fetchCsrfToken(agent);
		await agentSignUp(agent, xsrfToken);

		const spotRes = await agentCreateSpot(agent, xsrfToken);
		spot = spotRes.body;

		const imageRes = await agentCreateSpotImage(agent, xsrfToken, spot.id);
		spotImage = imageRes.body;

		const imageRes1 = await agentCreateSpotImage(agent, xsrfToken, spot.id);
		spotImage1 = imageRes1.body;

		//! Agent 2

		agent2 = createAgent(apiBaseUrl);
		xsrfToken2 = await fetchCsrfToken(agent2);
		await agentSignUp(agent2, xsrfToken2);

		const spotRes2 = await agentCreateSpot(agent2, xsrfToken2);
		spot2 = spotRes2.body;

		const imageRes2 = await agentCreateSpotImage(agent2, xsrfToken2, spot2.id);
		spotImage2 = imageRes2.body;

		agent3 = createAgent(apiBaseUrl);
		xsrfToken3 = await fetchCsrfToken(agent3);
	});

	describe('DELETE /api/spot-images/:imageId', () => {
		it('Correct Endpoint', (done) => {
			agent
				.delete(`/spot-images/${spotImage.id}`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect('Content-Type', /json/)
				.end((err, _res) => {
					expect(err).to.not.exist;
					done();
				});
		});

		it('Authentication', (done) => {
			agent3
				.delete(`/spot-images/${spotImage.id}`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken3)
				.expect('Content-Type', /json/)
				.expect(401)
				.end((err, _res) => {
					if (err) return done(err);
					return done();
				});
		});

		it('Authorization', (done) => {
			agent
				.delete(`/spot-images/${spotImage2.id}`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect('Content-Type', /json/)
				.expect(403)
				.end((err, _res) => {
					if (err) return done(err);
					return done();
				});
		});
	});

	describe('Response', () => {
		it('Status Code - 200', (done) => {
			agent
				.delete(`/spot-images/${spotImage.id}`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect('Content-Type', /json/)
				.expect(200)
				.end((_err, _res) => {
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			agent
				.delete(`/spot-images/${spotImage1.id}`)
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

	describe("Error response: Couldn't find a Spot Image with the specified id", () => {
		it('Status Code - 404', (done) => {
			agent
				.delete('/spot-images/2352352')
				.expect('Content-Type', /json/)
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect(404)
				.end((err, _res) => {
					if (err) return done(err);
					done();
				});
		});
		it('Body Matches API Docs', (done) => {
			agent
				.delete('/spot-images/2352352')
				.expect('Content-Type', /json/)
				.set('X-XSRF-TOKEN', xsrfToken)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.have.property(
						'message',
						"Spot Image couldn't be found",
					);
					done();
				});
		});
	});
});
