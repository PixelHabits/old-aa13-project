import { expect } from 'chai';
import { before, describe, it } from 'mocha';
import {
	agentCreateSpot,
	agentSignUp,
	createManyAgents,
	fetchManyCsrfTokens,
} from '../utils/agent-factory.mjs';
import { apiBaseUrl } from '../utils/constants.mjs';
import { expectedSpotKeys } from '../utils/err-helpers.mjs';

describe('Add Query Filters to Get All Spots', () => {
	let agent;
	let xsrfToken;
	let _agentSpot;
	let agent2;
	let _xsrfToken2;

	before(async function () {
		this.timeout(15000);
		[agent, agent2] = createManyAgents(apiBaseUrl, 2);
		[xsrfToken, _xsrfToken2] = await fetchManyCsrfTokens([agent, agent2]);
		await agentSignUp(agent, xsrfToken);
		const res = await agentCreateSpot(agent, xsrfToken);
		_agentSpot = res.body;
	});

	describe('GET /api/spot?query=params', () => {
		it('Correct Endpoint', (done) => {
			agent
				.get('/spots')
				.query({})
				.expect('Content-Type', /json/)
				.end((err, _res) => {
					expect(err).to.not.exist;
					done();
				});
		});
	});

	describe('Response', () => {
		it('Status Code - 200', (done) => {
			agent
				.get('/spots')
				.query({})
				.expect('Content-Type', /json/)
				.expect(200)
				.end((err, _res) => {
					expect(err).to.not.exist;
					done();
				});
		});

		describe('Body Matches API Docs', () => {
			it('No filter', (done) => {
				agent
					.get('/spots')
					.query({})
					.expect('Content-Type', /json/)
					.end((err, res) => {
						expect(err).to.not.exist;
						expect(res.body).to.be.an('object');
						expect(res.body).to.have.property('Spots').that.is.an('array');
						expect(res.body).to.include.keys('page', 'size');
						expect(res.body.page).to.equal(1);
						expect(res.body.size).to.equal(20);
						if (res.body.Spots.length > 0) {
							const spot = res.body.Spots[0];
							expect(spot).to.include.keys(expectedSpotKeys);
						}
						done();
					});
			});

			it('returns spots filtered by lat/lng', (done) => {
				agent
					.get('/spots')
					.query({
						minLat: 35,
						maxLat: 40,
						minLng: -123,
						maxLng: -120,
					})
					.expect('Content-Type', /json/)
					.expect(200)
					.end((err, res) => {
						expect(err).to.not.exist;
						expect(res.body).to.have.property('Spots').that.is.an('array');
						done();
					});
			});

			it('returns spots filtered by price range', (done) => {
				agent
					.get('/spots')
					.query({
						minPrice: 100,
						maxPrice: 200,
					})
					.expect('Content-Type', /json/)
					.expect(200)
					.end((err, res) => {
						expect(err).to.not.exist;
						expect(res.body).to.have.property('Spots').that.is.an('array');
						done();
					});
			});
		});
	});

	describe('Error Response: Query parameter validation errors', () => {
		describe('Status Code - 400', () => {
			it('returns an error for invalid query parameters', (done) => {
				agent
					.get('/spots')
					.query({
						size: 'niceTest!',
						page: 'testing',
					})
					.expect('Content-Type', /json/)
					.expect(400)
					.end((err, _res) => {
						expect(err).to.not.exist;
						done();
					});
			});

			it('returns an error for invalid min/max lng', (done) => {
				agent
					.get('/spots')
					.query({
						minLat: 'potato',
						minLng: 'ceremony',
					})
					.expect('Content-Type', /json/)
					.expect(400)
					.end((_err, _res) => {
						done();
					});
			});
		});

		describe('Body Matches API Docs', () => {
			it('returns an error for invalid query parameters', (done) => {
				agent
					.get('/spots')
					.query({
						size: 'niceTest!',
						page: 'testing',
					})
					.expect('Content-Type', /json/)
					.end((err, res) => {
						expect(err).to.not.exist;
						expect(res.body).to.have.property('message');
						expect(res.body.errors).to.include.keys('page', 'size');
						done();
					});
			});

			it('returns an error for invalid min/max lng', (done) => {
				agent
					.get('/spots')
					.query({
						minLat: 'potato',
						minLng: 'ceremony',
					})
					.expect('Content-Type', /json/)
					.end((err, res) => {
						expect(err).to.not.exist;
						expect(res.body).to.have.property('message');
						expect(res.body.errors).to.include.keys('minLat', 'minLng');
						done();
					});
			});
		});
	});
});
