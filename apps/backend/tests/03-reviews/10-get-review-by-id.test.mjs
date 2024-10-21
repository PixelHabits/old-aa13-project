import { expect } from 'chai';
import { before, describe, it } from 'mocha';
import {
	agentCreateReview,
	agentCreateSpot,
	agentSignUp,
	createManyAgents,
	fetchManyCsrfTokens,
} from '../utils/agent-factory.mjs';
import { apiBaseUrl } from '../utils/constants.mjs';

describe("\nGet all Reviews by a Spot's id", () => {
	let agent;
	let xsrfToken;
	let agentSpot;
	let agent2;
	let xsrfToken2;
	let agent3;
	let xsrfToken3;

	before(async function () {
		this.timeout(15000);
		const agentArr = createManyAgents(apiBaseUrl, 3);
		[agent, agent2, agent3] = agentArr;
		const xsrfTokens = await fetchManyCsrfTokens(agentArr);
		[xsrfToken, xsrfToken2, xsrfToken3] = xsrfTokens;
		await Promise.all(
			agentArr.map((el, idx) => agentSignUp(el, xsrfTokens[idx])),
		);

		const spotRes = await agentCreateSpot(agent, xsrfToken);
		agentSpot = spotRes.body;
		await agentCreateReview(agent2, xsrfToken2, agentSpot.id);
		await agentCreateReview(agent3, xsrfToken3, agentSpot.id);
	});

	describe('GET /api/spots/:spotId/reviews', () => {
		it('Correct Endpoint', (done) => {
			agent.get(`/spots/${agentSpot.id}/reviews`).end((err, _res) => {
				expect(err).to.not.exist;
				done();
			});
		});
	});

	describe('Response', () => {
		it('Status Code - 200', (done) => {
			agent
				.get(`/spots/${agentSpot.id}/reviews`)
				.expect(200)
				.end((err, _res) => {
					expect(err).to.not.exist;
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			agent
				.get(`/spots/${agentSpot.id}/reviews`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect('Content-Type', /json/)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('Reviews').that.is.an('array');

					if (res.body.Reviews.length > 0) {
						const reviewDetails = res.body.Reviews[0];
						expect(reviewDetails).to.include.keys(
							'id',
							'userId',
							'spotId',
							'review',
							'stars',
							'createdAt',
							'updatedAt',
							'User',
							'ReviewImages',
						);
						expect(reviewDetails.User).to.include.keys(
							'id',
							'firstName',
							'lastName',
						);
						expect(reviewDetails.ReviewImages).to.be.an('array');
					}
					done();
				});
		});
	});

	describe("Error response: Couldn't find a Spot with the specified id", () => {
		it('Status Code - 404', (done) => {
			agent
				.get('/spots/820329/reviews')
				.expect('Content-Type', /json/)
				.expect(404)
				.end((err, _res) => {
					expect(err).to.not.exist;
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			agent
				.get('/spots/820329/reviews')
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
