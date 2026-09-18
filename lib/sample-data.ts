// Synthetic demo export. It is never saved or compared with real history.
const relation = (value: string) => ({
  title: value,
  string_list_data: [{ value, href: `https://www.instagram.com/${value}/`, timestamp: 1700000000 }],
});
export const SAMPLE_FOLLOWING_JSON = {
  relationships_following: [
    'demo_alice',
    'demo_bob',
    'demo_carol',
    'demo_dana',
    'demo_elliot',
    'demo_finn',
  ].map(relation),
};
export const SAMPLE_FOLLOWERS_JSON = ['demo_alice', 'demo_bob', 'demo_carol', 'demo_grace'].map(
  relation,
);
