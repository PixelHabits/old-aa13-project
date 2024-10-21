import { expect } from 'chai';
import { before, describe, it } from 'mocha';
import {
	agentCreateReview,
	agentCreateSpot,
	agentSignUp,
	createAgent,
	createManyAgents,
	fetchCsrfToken,
	fetchManyCsrfTokens,
} from '../utils/agent-factory.mjs';
import { apiBaseUrl } from '../utils/constants.mjs';

describe('\nDelete a Review', () => {
	let agent;
	let xsrfToken;
	let agentSpot;
	let agent2;
	let xsrfToken2;
	let agent2Review;
	let agent3;
	let xsrfToken3;
	let agent3Review;
	let agent4;
	let xsrfToken4;
	let _agent4Review;
	let agent5;
	let xsrfToken5;
	let agent5Review;
	let agent6;
	let xsrfToken6;
	let agent6Review;
	let agent7;
	let xsrfToken7;

	before(async function () {
		this.timeout(15000);
		const agentArr = createManyAgents(apiBaseUrl, 6);
		[agent, agent2, agent3, agent4, agent5, agent6] = agentArr;

		const xsrfTokens = await fetchManyCsrfTokens(agentArr);
		[xsrfToken, xsrfToken2, xsrfToken3, xsrfToken4, xsrfToken5, xsrfToken6] =
			xsrfTokens;

		await Promise.all(
			agentArr.map((el, idx) => agentSignUp(el, xsrfTokens[idx])),
		);

		agent7 = createAgent(apiBaseUrl);
		xsrfToken7 = await fetchCsrfToken(agent7);

		const spotRes = await agentCreateSpot(agent, xsrfToken);
		agentSpot = spotRes.body;

		//! review 0
		const reviewRes = await agentCreateReview(agent2, xsrfToken2, agentSpot.id);
		agent2Review = reviewRes.body;

		//! review 1
		const reviewRes1 = await agentCreateReview(
			agent3,
			xsrfToken3,
			agentSpot.id,
		);
		agent3Review = reviewRes1.body;

		//! review 2
		const reviewRes2 = await agentCreateReview(
			agent4,
			xsrfToken4,
			agentSpot.id,
		);
		_agent4Review = reviewRes2.body;

		//! review 3
		const reviewRes3 = await agentCreateReview(
			agent5,
			xsrfToken5,
			agentSpot.id,
		);
		agent5Review = reviewRes3.body;

		//! review 4
		const reviewRes4 = await agentCreateReview(
			agent6,
			xsrfToken6,
			agentSpot.id,
		);
		agent6Review = reviewRes4.body;
	});

	describe('DELETE /api/reviews/:reviewId', () => {
		it('Correct Endpoint', (done) => {
			agent2
				.delete(`/reviews/${agent2Review.id}`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken2)
				.expect('Content-Type', /json/)
				.end((err, _res) => {
					expect(err).to.not.exist;
					done();
				});
		});

		it('Authentication', (done) => {
			agent7
				.delete(`/reviews/${agent3Review.id}`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken7)
				.expect(401)
				.end((err, _res) => {
					if (err) return done(err);
					return done();
				});
		});

		it('Authorization', (done) => {
			agent4
				.delete(`/reviews/${agent5Review.id}`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken4)
				.expect(403)
				.end((err, _res) => {
					if (err) return done(err);
					return done();
				});
		});
	});

	describe('Response', () => {
		it('Status Code - 200', (done) => {
			agent5
				.delete(`/reviews/${agent5Review.id}`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken5)
				.expect('Content-Type', /json/)
				.expect(200)
				.end((err, _res) => {
					expect(err).to.not.exist;
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			agent6
				.delete(`/reviews/${agent6Review.id}`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken6)
				.expect('Content-Type', /json/)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.have.property('message', 'Successfully deleted');
					done();
				});
		});
	});

	describe("Error response: Couldn't find a Review with the specified id", () => {
		it('Status Code - 404', (done) => {
			agent2
				.delete('/reviews/523523')
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken2)
				.expect('Content-Type', /json/)
				.expect(404)
				.end((err, _res) => {
					expect(err).to.not.exist;
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			agent2
				.delete('/reviews/523523')
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken2)
				.expect('Content-Type', /json/)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.have.property(
						'message',
						"Review couldn't be found",
					);
					done();
				});
		});
	});
});
