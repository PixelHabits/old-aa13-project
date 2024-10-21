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

describe('\nGet all Reviews of the Current User', () => {
	let agent;
	let xsrfToken;
	let agent2;
	let xsrfToken2;
	let _agentSpot;
	let agent2Spot;
	let _agentReview;
	let agent3;
	let xsrfToken3;

	before(async function () {
		this.timeout(15000);
		[agent, agent2, agent3] = createManyAgents(apiBaseUrl, 3);
		[xsrfToken, xsrfToken2, xsrfToken3] = await fetchManyCsrfTokens([
			agent,
			agent2,
			agent3,
		]);

		await agentSignUp(agent, xsrfToken);
		const res = await agentCreateSpot(agent, xsrfToken);
		_agentSpot = res.body;

		await agentSignUp(agent2, xsrfToken2);
		const agent2Res = await agentCreateSpot(agent2, xsrfToken2);
		agent2Spot = agent2Res.body;

		const reviewRes = await agentCreateReview(agent, xsrfToken, agent2Spot.id);
		_agentReview = reviewRes.body;
	});

	describe('GET /api/reviews/current', () => {
		it('Correct Endpoint', (done) => {
			agent.get('/reviews/current').end((err, _res) => {
				expect(err).to.not.exist;
				done();
			});
		});

		it('Authentication', (done) => {
			agent3
				.get('/reviews/current')
				.set('X-XSRF-TOKEN', xsrfToken3)
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
				.get('/reviews/current')
				.expect(200)
				.end((err, _res) => {
					expect(err).to.not.exist;
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			agent
				.get('/reviews/current')
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect('Content-Type', /json/)
				.expect(200)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.be.an('object');
					expect(res.body).to.have.property('Reviews').that.is.an('array');

					if (res.body.Reviews.length > 0) {
						const review = res.body.Reviews[0];
						expect(review).to.include.keys(
							'id',
							'userId',
							'spotId',
							'review',
							'stars',
							'createdAt',
							'updatedAt',
							'User',
							'Spot',
							'ReviewImages',
						);
						expect(review.User).to.include.keys('id', 'firstName', 'lastName');
						expect(review.Spot).to.include.keys(
							'id',
							'ownerId',
							'address',
							'city',
							'state',
							'country',
							'lat',
							'lng',
							'name',
							'price',
							'previewImage',
						);
						expect(review.ReviewImages).to.be.an('array');
					}
					done();
				});
		});
	});
});
