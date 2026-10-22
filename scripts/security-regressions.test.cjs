const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');

// Resolve through the real consumers, not stale entries in pnpm's store.
const at = relative => createRequire(path.resolve(__dirname, '..', relative, 'package.json'));
const child = (parent, name) => createRequire(parent.resolve(`${name}/package.json`));
const mobile = at('artifacts/somani-cook-book');
const canvas = at('artifacts/mockup-sandbox');
const api = at('artifacts/api-server');
const cli = child(child(mobile, 'expo'), '@expo/cli');
const braces = child(child(canvas, 'fast-glob'), 'micromatch')('braces');
const forge = cli('node-forge');

test('braces preserves ordinary brace, range, and escaped patterns', () => {
  assert.deepEqual(braces.expand('src/{app,lib}/{1..2}.ts'), [
    'src/app/1.ts', 'src/app/2.ts', 'src/lib/1.ts', 'src/lib/2.ts',
  ]);
  assert.deepEqual(braces('src/{app,lib}/*.ts'), ['src/(app|lib)/*.ts']);
  assert.deepEqual(braces.expand('a/\\{b,c\\}'), ['a/{b,c}']);
  const ordinary = '{'.repeat(20) + 'a,b' + '}'.repeat(20);
  assert.doesNotThrow(() => braces.expand(ordinary));
});

test('braces rejects excessive brace and parenthesis nesting, including unclosed input', () => {
  for (const [open, close] of [['{', '}'], ['(', ')']]) {
    for (const input of [
      open.repeat(4000) + 'a,b' + close.repeat(4000),
      open.repeat(4000) + 'a,b',
    ]) {
      for (const operation of [braces, braces.parse, braces.compile, braces.expand, braces.stringify]) {
        assert.throws(() => operation(input), {
          name: 'SyntaxError', message: 'Pattern nesting exceeds maximum depth (256)',
        });
      }
    }
  }
});

test('braces also bounds walkers when given a caller-built AST', () => {
  const ast = { type: 'root', nodes: [] };
  let current = ast;
  for (let i = 0; i < 10000; i++) {
    const next = { type: 'paren', nodes: [], parent: current };
    current.nodes.push(next);
    current = next;
  }
  current.nodes.push({ type: 'text', value: 'x', parent: current });
  for (const operation of [braces.compile, braces.expand, braces.stringify]) {
    assert.throws(() => operation(ast), {
      name: 'SyntaxError', message: 'Pattern nesting exceeds maximum depth (256)',
    });
  }
});

test('forge verifies legitimate signatures but rejects extra nested DigestAlgorithm elements', () => {
  const keys = forge.pki.rsa.generateKeyPair({ bits: 1024, e: 3 });
  const md = forge.md.sha256.create().update('security regression');
  const digest = md.digest().getBytes();
  assert.equal(keys.publicKey.verify(digest, keys.privateKey.sign(md)), true);
  const { asn1 } = forge;
  const element = (type, value, constructed = false) =>
    asn1.create(asn1.Class.UNIVERSAL, type, constructed, value);
  const oid = () => element(asn1.Type.OID, asn1.oidToDer(forge.oids.sha256).getBytes());
  const nullParameter = () => element(asn1.Type.NULL, '');
  const signDigestInfo = algorithm => keys.privateKey.sign(asn1.toDer(
    element(asn1.Type.SEQUENCE, [
      element(asn1.Type.SEQUENCE, algorithm, true),
      element(asn1.Type.OCTETSTRING, digest),
    ], true),
  ).getBytes(), 'NONE');

  // RFC 8017 allows SHA-2 parameters to be absent or NULL.
  for (const algorithm of [[oid()], [oid(), nullParameter()]]) {
    assert.equal(keys.publicKey.verify(digest, signDigestInfo(algorithm)), true);
  }
  for (const algorithm of [
    [oid(), nullParameter(), element(asn1.Type.OCTETSTRING, 'garbage')],
    [oid(), element(asn1.Type.OCTETSTRING, 'garbage')],
    [oid(), element(asn1.Type.NULL, 'garbage')],
  ]) {
    assert.throws(() => keys.publicKey.verify(digest, signDigestInfo(algorithm)),
      /valid RSASSA-PKCS1-v1_5 DigestInfo/);
  }
});

test('Expo query-string works with the patched ESM decoder', { timeout: 2000 }, () => {
  const queryString = child(mobile, 'expo-router')('query-string');
  assert.deepEqual({ ...queryString.parse('name=family%20recipe&tag=a%2Fb') }, {
    name: 'family recipe', tag: 'a/b',
  });
  assert.equal(queryString.parse('x=%E0%A4%A').x, '%E0%A4%A');
  assert.equal(typeof queryString.parse('x=' + '%FF'.repeat(10000)).x, 'string');
  assert.equal(queryString.stringify({ name: 'family recipe' }), 'name=family%20recipe');
});

test('xcode can still generate UUIDs through its CommonJS dependency', () => {
  const xcode = child(child(mobile, 'expo'), '@expo/config-plugins')('xcode');
  const project = xcode.project('/tmp/security-test.pbxproj');
  project.hash = { project: { objects: {} } };
  assert.match(project.generateUuid(), /^[A-F0-9]{24}$/);
  const uuid = child(child(child(mobile, 'expo'), '@expo/config-plugins'), 'xcode')('uuid');
  assert.throws(() => uuid.v5('x', uuid.v5.DNS, new Uint8Array(8), 4), RangeError);
});

test('proxy-addr does not trust every IPv4 client for short mapped-IPv6 prefixes', () => {
  const proxyaddr = child(api, 'express')('proxy-addr');
  assert.equal(proxyaddr.compile('::ffff:10.0.0.0/8')('203.0.113.1'), false);
  assert.equal(proxyaddr.compile('::/1')('203.0.113.1'), false);
  assert.equal(proxyaddr.compile('10.0.0.0/8')('10.1.2.3'), true);
});
