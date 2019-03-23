// Copyright 2019 @polkadot/wasm-schnorrkel authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// @ts-check

const crypto = require('crypto');
const { assert, hexToU8a, stringToU8a, u8aToHex } = require('@polkadot/util');
const schnorrkel = require('../build/index');

function extractKeys (pair) {
  return [pair, pair.slice(64), pair.slice(0, 64)];
}

function randomPair () {
  return extractKeys(schnorrkel.keypairFromSeed(crypto.randomBytes(32)));
}

function pairFromSeed () {
  const pair = schnorrkel.keypairFromSeed(stringToU8a('12345678901234567890123456789012'));

  console.log('\tSEC', u8aToHex(pair.slice(0, 64)));
  console.log('\tPUB', u8aToHex(pair.slice(64)));

  assert(u8aToHex(pair) === '0xf0106660c3dda23f16daa9ac5b811b963077f5bc0af89f85804f0de8e424f050f98d66f39442506ff947fd911f18c7a7a5da639a63e8d3b4e233f74143d951c1741c08a06f41c596608f6774259bd9043304adfa5d3eea62760bd9be97634d63', 'ERROR: pairFromSeed() does not match');
}

function devFromSeed () {
  const pair = schnorrkel.keypairFromSeed(hexToU8a('0xfac7959dbfe72f052e5a0c3c8d6530f202b02fd8f9f5ca3580ec8deb7797479e'));

  console.log('\tSEC', u8aToHex(pair.slice(0, 64)));
  console.log('\tPUB', u8aToHex(pair.slice(64)));

  assert(u8aToHex(pair) === '0x28b0ae221c6bb06856b287f60d7ea0d98552ea5a16db16956849aa371db3eb51fd190cce74df356432b410bd64682309d6dedb27c76845daf388557cbac3ca3446ebddef8cd9bb167dc30878d7113b7e168e6f0646beffd77d69d39bad76b47a', 'ERROR: devFromSeed() does not match');
}

function verifyExisting () {
  const PK = hexToU8a('0x741c08a06f41c596608f6774259bd9043304adfa5d3eea62760bd9be97634d63');
  const MESSAGE = stringToU8a('this is a message');
  const SIGNATURE = hexToU8a('0xdecef12cf20443e7c7a9d406c237e90bcfcf145860722622f92ebfd5eb4b5b3990b6443934b5cba8f925a0ae75b3a77d35b8490cbb358dd850806e58eaf72904'
);

  const isValid = schnorrkel.verify(SIGNATURE, MESSAGE, PK);

  console.log('\tRES', isValid);

  assert(isValid, 'ERROR: Unable to verify signature');
}

function signAndVerify () {
  const [, pk, sk] = randomPair();
  const signature = schnorrkel.sign(pk, sk, stringToU8a('this is a message'));
  const isValid = schnorrkel.verify(signature, stringToU8a('this is a message'), pk);

  console.log('\tSIG', u8aToHex(signature));
  console.log('\tRES', isValid);

  assert(isValid, 'ERROR: Unable to verify signature');
}

function deriveHard () {
  const [pair] = randomPair();
  const derived = schnorrkel.deriveKeypairHard(pair, hexToU8a('0x0c666f6f00000000000000000000000000000000000000000000000000000000'));

  console.log('\tSEC', u8aToHex(derived.slice(0, 64)));
  console.log('\tPUB', u8aToHex(derived.slice(64)));
}

function deriveHardKnown () {
  const derived = schnorrkel.deriveKeypairHard(hexToU8a('0x28b0ae221c6bb06856b287f60d7ea0d98552ea5a16db16956849aa371db3eb51fd190cce74df356432b410bd64682309d6dedb27c76845daf388557cbac3ca3446ebddef8cd9bb167dc30878d7113b7e168e6f0646beffd77d69d39bad76b47a'), hexToU8a('0x14416c6963650000000000000000000000000000000000000000000000000000'));
  const publicKey = u8aToHex(derived.slice(64));

  console.log('\tSEC', u8aToHex(derived.slice(0, 64)));
  console.log('\tPUB', publicKey);

  assert(publicKey === '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d', 'Unmatched resulting public keys');
}

function deriveSoft () {
  const [pair] = randomPair();
  const derived = schnorrkel.deriveKeypairSoft(pair, hexToU8a('0x0c666f6f00000000000000000000000000000000000000000000000000000000'));

  console.log('\tSEC', u8aToHex(derived.slice(0, 64)));
  console.log('\tPUB', u8aToHex(derived.slice(64)));
}

function deriveSoftKnown () {
  const derived = schnorrkel.deriveKeypairSoft(hexToU8a('0x28b0ae221c6bb06856b287f60d7ea0d98552ea5a16db16956849aa371db3eb51fd190cce74df356432b410bd64682309d6dedb27c76845daf388557cbac3ca3446ebddef8cd9bb167dc30878d7113b7e168e6f0646beffd77d69d39bad76b47a'), hexToU8a('0x0c666f6f00000000000000000000000000000000000000000000000000000000'));
  const publicKey = u8aToHex(derived.slice(64));

  console.log('\tSEC', u8aToHex(derived.slice(0, 64)));
  console.log('\tPUB', publicKey);

  assert(publicKey === '0x40b9675df90efa6069ff623b0fdfcf706cd47ca7452a5056c7ad58194d23440a', 'Unmatched resulting public keys');
}

function deriveSoftPubkey () {
  const derived = u8aToHex(schnorrkel.derivePublicSoft( hexToU8a('0x46ebddef8cd9bb167dc30878d7113b7e168e6f0646beffd77d69d39bad76b47a'), hexToU8a('0x0c666f6f00000000000000000000000000000000000000000000000000000000')));

  console.log('\tPUB', derived);

  assert(derived === '0x40b9675df90efa6069ff623b0fdfcf706cd47ca7452a5056c7ad58194d23440a', 'Unmatched resulting public keys');
}

function benchmark () {
  const MESSAGE = stringToU8a('this is a message');

  for (let i = 0; i < 256; i++) {
    const [, pk, sk] = randomPair();

    assert(schnorrkel.verify(schnorrkel.sign(pk, sk, MESSAGE), MESSAGE, pk), 'ERROR: Unable to verify signature');
  }
}

const tests = {
  pairFromSeed,
  devFromSeed,
  deriveHard,
  deriveHardKnown,
  deriveSoft,
  deriveSoftKnown,
  deriveSoftPubkey,
  signAndVerify,
  verifyExisting,
  benchmark
};

module.exports.beforeAll = async function beforeAll () {
  return schnorrkel.waitReady();
}

module.exports.runAll = function runAll () {
  Object.keys(tests).forEach((name) => {
    console.time(name);
    console.log();
    console.log(name);

    tests[name]();

    console.timeEnd(name);
  });
}

module.exports.tests = tests;