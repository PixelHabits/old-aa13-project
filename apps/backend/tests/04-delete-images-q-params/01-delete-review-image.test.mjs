import { expect } from 'chai';
import { before, describe, it } from 'mocha';
import {
	agentCreateReview,
	agentCreateReviewImage,
	agentCreateSpot,
	agentSignUp,
	createAgent,
	createManyAgents,
	fetchCsrfToken,
	fetchManyCsrfTokens,
} from '../utils/agent-factory.mjs';
import { apiBaseUrl } from '../utils/constants.mjs';

describe('\nDelete a Review Image', () => {
	let agent;
	let xsrfToken;
	let agentSpot;
	let agent2;
	let xsrfToken2;
	let agent3;
	let xsrfToken3;
	let agent2Review;
	let reviewImage;
	let agent3Review3;
	let reviewImage3;
	let agent4;
	let xsrfToken4;

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

		//! review 1
		const reviewRes = await agentCreateReview(agent2, xsrfToken2, agentSpot.id);
		agent2Review = reviewRes.body;
		const reviewImageRes = await agentCreateReviewImage(
			agent2,
			xsrfToken2,
			agent2Review.id,
		);

		reviewImage = reviewImageRes.body;

		//! review 2
		const reviewRes3 = await agentCreateReview(
			agent3,
			xsrfToken3,
			agentSpot.id,
		);
		agent3Review3 = reviewRes3.body;
		const reviewImageRes3 = await agentCreateReviewImage(
			agent3,
			xsrfToken3,
			agent3Review3.id,
		);
		reviewImage3 = reviewImageRes3.body;

		agent4 = createAgent(apiBaseUrl);
		xsrfToken4 = await fetchCsrfToken(agent4);
	});

	describe('DELETE /api/review-images/:imageId', () => {
		it('Correct Endpoint', (done) => {
			agent2
				.delete(`/review-images/${reviewImage.id}`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken2)
				.expect('Content-Type', /json/)
				.end((_err, _res) => {
					done();
				});
		});

		it('Authentication', (done) => {
			agent4
				.delete(`/review-images/${reviewImage.id}`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken4)
				.expect(401)
				.end((err, _res) => {
					if (err) return done(err);
					done();
				});
		});

		it('Authorization', (done) => {
			agent2
				.delete(`/review-images/${reviewImage3.id}`)
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
			agent2
				.delete(`/review-images/${reviewImage.id}`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken2)
				.expect('Content-Type', /json/)
				.expect(200)
				.end((_err, _res) => {
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			agent3
				.delete(`/review-images/${reviewImage3.id}`)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken3)
				.expect('Content-Type', /json/)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.have.property('message', 'Successfully deleted');
					done();
				});
		});
	});

	describe("Error response: Couldn't find a Review Image with the specified id", () => {
		it('Status Code - 404', (done) => {
			agent2
				.delete('/review-images/252352352')
				.set('X-XSRF-TOKEN', xsrfToken2)
				.expect('Content-Type', /json/)
				.expect(404)
				.end((err, _res) => {
					if (err) return done(err);
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			agent2
				.delete('/review-images/252352352')
				.set('X-XSRF-TOKEN', xsrfToken2)
				.expect('Content-Type', /json/)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.have.property(
						'message',
						"Review Image couldn't be found",
					);
					done();
				});
		});
	});
});
