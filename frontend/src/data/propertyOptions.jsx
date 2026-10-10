import { Building, House, KeyRound } from '../components/PropertyIcons';
import buyHomeImage from '../assets/property-options/buy-home.png';
import rentHomeImage from '../assets/property-options/rent-home.png';
import listPropertyImage from '../assets/property-options/list-property.png';

export const propertyOptions = [
  { icon: <House />, image: buyHomeImage, title: 'Buy a home', text: 'Find a place to own, at your pace.', action: 'Buy' },
  { icon: <KeyRound />, image: rentHomeImage, title: 'Rent a home', text: 'Move into a home you will love.', action: 'Rent' },
  { icon: <Building />, image: listPropertyImage, title: 'List property', text: 'Reach serious home seekers.', action: 'List' },
];
