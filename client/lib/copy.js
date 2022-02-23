import clone from 'rfdc';

export default function copy(obj) {
  return clone()(obj);
}
