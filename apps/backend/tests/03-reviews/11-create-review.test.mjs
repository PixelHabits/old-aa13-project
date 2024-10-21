import { expect } from 'chai';
import { before, describe, it } from 'mocha';
import {
	agentCreateSpot,
	agentSignUp,
	createAgent,
	createManyAgents,
	fetchCsrfToken,
	fetchManyCsrfTokens,
} from '../utils/agent-factory.mjs';
import { apiBaseUrl } from '../utils/constants.mjs';

describe("\nCreate a Review for a Spot based on the Spot's id", () => {
	let agent;
	let xsrfToken;
	let agentSpot;
	let agent2;
	let xsrfToken2;
	let agent3;
	let xsrfToken3;
	let agent4;
	let xsrfToken4;
	let agent5;
	let xsrfToken5;
	let _agent6;
	let _xsrfToken6;
	let agent7;
	let xsrfToken7;

	before(async function () {
		this.timeout(15000);
		const agentArr = createManyAgents(apiBaseUrl, 6);
		[agent, agent2, agent3, agent4, agent5, _agent6] = agentArr;

		const xsrfTokens = await fetchManyCsrfTokens(agentArr);
		[xsrfToken, xsrfToken2, xsrfToken3, xsrfToken4, xsrfToken5, _xsrfToken6] =
			xsrfTokens;

		await Promise.all(
			agentArr.map((el, idx) => agentSignUp(el, xsrfTokens[idx])),
		);
		agent7 = createAgent(apiBaseUrl);
		xsrfToken7 = await fetchCsrfToken(agent7);

		const spotRes = await agentCreateSpot(agent, xsrfToken);
		agentSpot = spotRes.body;
	});

	describe('POST /api/spots/:spotId/reviews', () => {
		it('Correct Endpoint', (done) => {
			const reviewData = {
				review: 'This was an awesome spot for testing!',
				stars: 5,
			};
			agent2
				.post(`/spots/${agentSpot.id}/reviews`)
				.send(reviewData)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken2)
				.end((err, _res) => {
					expect(err).to.not.exist;
					done();
				});
		});

		it('Authentication', (done) => {
			const reviewData = {
				review: 'This was a cool spot for testing!',
				stars: 5,
			};
			agent7
				.post(`/spots/${agentSpot.id}/reviews`)
				.send(reviewData)
				.set('X-XSRF-TOKEN', xsrfToken7)
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
			const reviewData = {
				review: 'This was an amazing spot for testing!',
				stars: 5,
			};
			agent4
				.post(`/spots/${agentSpot.id}/reviews`)
				.send(reviewData)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken4)
				.expect(201)
				.end((err, _res) => {
					expect(err).to.not.exist;
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			const reviewData = {
				review: 'This was an awesome spot for testing!',
				stars: 5,
			};
			agent5
				.post(`/spots/${agentSpot.id}/reviews`)
				.send(reviewData)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken5)
				.expect('Content-Type', /json/)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.be.an('object');
					expect(res.body).to.include.keys(
						'id',
						'userId',
						'spotId',
						'review',
						'stars',
						'createdAt',
						'updatedAt',
					);
					expect(res.body.review).to.equal(reviewData.review);
					expect(res.body.stars).to.equal(reviewData.stars);
					done();
				});
		});
	});

	describe('Error Response: Body validation errors', () => {
		it('Status Code - 400', (done) => {
			const reviewData = {
				review: '',
				stars: 6,
			};

			agent3
				.post(`/spots/${agentSpot.id}/reviews`)
				.send(reviewData)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken3)
				.expect('Content-Type', /json/)
				.expect(400)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.have.property('message');
					expect(res.body.errors).to.include.keys('review', 'stars');
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			const reviewData = {
				review: '',
				stars: 6,
			};
			agent3
				.post(`/spots/${agentSpot.id}/reviews`)
				.send(reviewData)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken3)
				.expect('Content-Type', /json/)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.have.property('message');
					expect(res.body.errors).to.include.keys('review', 'stars');
					done();
				});
		});
	});

	describe("Error Response: Couldn't find a Spot with the specified id", () => {
		it('Status Code - 404', (done) => {
			agent
				.post('/spots/235235/reviews')
				.send({ review: 'Great spot for testing reviews!', stars: 5 })
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
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

		it('Body Matches API Docs', (done) => {
			agent
				.post('/spots/235235/reviews')
				.send({ review: 'Great spot for testing reviews!', stars: 5 })
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

	describe('Error Response: Review from the current user already exists for the Spot', () => {
		it('Status Code - 500', (done) => {
			const reviewData = {
				review: 'This was an awesome spot for testing reviews!',
				stars: 5,
			};
			agent2
				.post(`/spots/${agentSpot.id}/reviews`)
				.send(reviewData)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken2)
				.expect('Content-Type', /json/)
				.expect(500)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.have.property(
						'message',
						'User already has a review for this spot',
					);
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			const reviewData = {
				review: 'This was an awesome spot for testing reviews!',
				stars: 5,
			};
			agent2
				.post(`/spots/${agentSpot.id}/reviews`)
				.send(reviewData)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken2)
				.expect('Content-Type', /json/)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.have.property(
						'message',
						'User already has a review for this spot',
					);
					done();
				});
		});
	});
});
