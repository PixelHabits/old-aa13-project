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
import { generateUniqueUsername } from '../utils/agent-helpers.mjs';
import { apiBaseUrl } from '../utils/constants.mjs';

describe("\nAdd an Image to a Review based on the Review's id", () => {
	let agent;
	let xsrfToken;
	let agentSpot;
	let agent2;
	let xsrfToken2;
	let agent3;
	let xsrfToken3;
	let agent2Review;
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

		agent4 = createAgent(apiBaseUrl);
		xsrfToken4 = await fetchCsrfToken(agent4);

		const spotRes = await agentCreateSpot(agent, xsrfToken);
		agentSpot = spotRes.body;

		const reviewRes = await agentCreateReview(agent2, xsrfToken2, agentSpot.id);
		agent2Review = reviewRes.body;
	});

	describe('POST /api/reviews/:reviewId/images', () => {
		it('Correct Endpoint', (done) => {
			const imageData = {
				url: 'imageTest.png',
			};
			agent2
				.post(`/reviews/${agent2Review.id}/images`)
				.send(imageData)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken2)
				.expect('Content-Type', /json/)
				.end((err, _res) => {
					expect(err).to.not.exist;
					done();
				});
		});

		it('Authentication', (done) => {
			const imageData = {
				url: `${generateUniqueUsername()}.png`,
			};
			agent4
				.post(`/reviews/${agent2Review.id}/images`)
				.send(imageData)
				.set('X-XSRF-TOKEN', xsrfToken4)
				.set('Accept', 'application/json')
				.expect(401)
				.end((err, _res) => {
					if (err) return done(err);
					done();
				});
		});

		it('Authorization', (done) => {
			const imageData = {
				url: `${generateUniqueUsername()}.png`,
			};
			agent3
				.post(`/reviews/${agent2Review.id}/images`)
				.set('X-XSRF-TOKEN', xsrfToken3)
				.set('Accept', 'application/json')
				.send(imageData)
				.expect(403)
				.end((err, _res) => {
					if (err) return done(err);
					done();
				});
		});
	});

	describe('Response', () => {
		it('Status Code - 201', (done) => {
			const imageData = {
				url: `${generateUniqueUsername()}.png`,
			};
			agent2
				.post(`/reviews/${agent2Review.id}/images`)
				.send(imageData)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken2)
				.expect(201)
				.end((err, _res) => {
					if (err) return done(err);
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			const imageData = {
				url: `${generateUniqueUsername()}.png`,
			};
			agent2
				.post(`/reviews/${agent2Review.id}/images`)
				.send(imageData)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken2)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.be.an('object');
					expect(res.body).to.include.keys('id', 'url');
					expect(res.body.url).to.equal(imageData.url);
					done();
				});
		});
	});

	describe("Error response: Couldn't find a Review with the specified id", () => {
		it('Status Code - 404', (done) => {
			const imageData = {
				url: `${generateUniqueUsername()}.png`,
			};
			agent2
				.post('/reviews/2523532/images')
				.send(imageData)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken2)
				.expect('Content-Type', /json/)
				.expect(404)
				.end((err, _res) => {
					if (err) return done(err);
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			const imageData = {
				url: `${generateUniqueUsername()}.png`,
			};

			agent2
				.post('/reviews/2523532/images')
				.send(imageData)
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
