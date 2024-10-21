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
import { expectedSpotByIdKeys } from '../utils/err-helpers.mjs';

describe('\nGet details of a Spot from an id', () => {
	let agent;
	let xsrfToken;
	let spotId;

	before(async function () {
		this.timeout(15000);
		agent = createAgent(apiBaseUrl);
		xsrfToken = await fetchCsrfToken(agent);
		await agentSignUp(agent, xsrfToken);
		const res = await agentCreateSpot(agent, xsrfToken);
		spotId = res.body.id;
		const imageRes = await agentCreateSpotImage(agent, xsrfToken, spotId);
		agent.image = imageRes;
	});
	describe('GET /api/spots/:spotId', () => {
		it('Correct Endpoint', (done) => {
			agent.get(`/spots/${spotId}`).end((err, _res) => {
				expect(err).to.not.exist;
				done();
			});
		});
	});

	describe('Response', () => {
		it('Status Code - 200', (done) => {
			agent
				.get(`/spots/${spotId}`)
				.expect(200)
				.end((err, _res) => {
					expect(err).to.not.exist;
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			agent
				.get(`/spots/${spotId}`)
				.expect('Content-Type', /json/)
				.expect(200)
				.end((err, res) => {
					expect(err).to.not.exist;
					expect(res.body).to.be.an('object');
					expect(res.body).to.include.keys(expectedSpotByIdKeys);
					const { SpotImages, Owner, id } = res.body;
					expect(id).to.equal(spotId);
					expect(SpotImages).to.be.an('array');
					expect(Owner)
						.to.be.an('object')
						.and.to.have.all.keys('id', 'firstName', 'lastName');
					expect(Owner.firstName).to.be.a('string');
					expect(Owner.lastName).to.be.a('string');
					expect(SpotImages[0]).to.have.all.keys('id', 'url', 'preview');
					done();
				});
		});
	});

	describe('Error Response', () => {
		it('Status Code - 404', (done) => {
			const nonExistentSpotId = 2352351;
			agent
				.get(`/spots/${nonExistentSpotId}`)
				.expect('Content-Type', /json/)
				.expect(404)
				.end((err, _res) => {
					expect(err).to.not.exist;

					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			const nonExistentSpotId = 2352351;
			agent
				.get(`/spots/${nonExistentSpotId}`)
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
