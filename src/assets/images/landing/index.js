// Centralized asset imports for landing images
// Use static imports so Next/Webpack resolves and serves files from the bundle
import imgFeature1 from './img-feature1.svg';
import imgFeature2 from './img-feature2.svg';
import imgFeature3 from './img-feature3.svg';

import imgDemo1 from './img-demo1.jpg';
import imgDemo2 from './img-demo2.jpg';
import imgDemo3 from './img-demo3.jpg';

import techCI from './technology/tech-ci.png';
import techAngular from './technology/tech-angular.png';
import techBootstrap from './technology/tech-bootstrap.png';
import techDotnet from './technology/tech-dot-net.png';
import techVue from './technology/tech-vue.png';

import techCIDark from './technology/tech-ci-dark.png';
import techAngularDark from './technology/tech-angular-dark.png';
import techBootstrapDark from './technology/tech-bootstrap-dark.png';
import techDotnetDark from './technology/tech-dot-net-dark.png';
import techVueDark from './technology/tech-vue-dark.png';

import imgHeaderTech from './img-headertech.svg';
import figmaDefault from './figma-light.png';

import imgElementMsg from './img-element-msg.png';
import imgElementWidget from './img-element-widget.png';
import imgElementMainDefault from './img-element-main-default.png';

import imgBgScreen from './img-bg-screen.png';
import codedthemesLogo from './codedthemes-logo.svg';
import imgFooterDefault from './img-footer-default.png';
import imgFooterTheme1 from './img-footer-theme1.png';
import imgFooterTheme2 from './img-footer-theme2.png';
import imgFooterTheme3 from './img-footer-theme3.png';
import imgFooterTheme4 from './img-footer-theme4.png';
import imgFooterTheme5 from './img-footer-theme5.png';
import imgFooterTheme6 from './img-footer-theme6.png';
import imgFooterTheme7 from './img-footer-theme7.png';
import imgFooterTheme8 from './img-footer-theme8.png';

import bgMockupDefault from './bg-mockup-default.png';
import bgMockupTheme1 from './bg-mockup-theme1.png';
import bgMockupTheme2 from './bg-mockup-theme2.png';
import bgMockupTheme3 from './bg-mockup-theme3.png';
import bgMockupTheme4 from './bg-mockup-theme4.png';
import bgMockupTheme5 from './bg-mockup-theme5.png';
import bgMockupTheme6 from './bg-mockup-theme6.png';
import bgMockupTheme7 from './bg-mockup-theme7.png';
import bgMockupTheme8 from './bg-mockup-theme8.png';

// clients
import atishay from './clients/atishay.jpeg';
import brandons from './clients/brandons.jpeg';
import prajwal from './clients/prajwal.jpeg';
import yingchun from './clients/yingchun.jpeg';

export const clients = {
  'atishay.jpeg': atishay,
  'brandons.jpeg': brandons,
  'prajwal.jpeg': prajwal,
  'yingchun.jpeg': yingchun
};

// fallback keys for BrowserBlock and similar dynamic patterns
export const dynamic = {
  'default-dark': figmaDefault, // keep reasonable defaults
  'default-light': figmaDefault,
  'figma-default': figmaDefault
};

export const footer = {
  codedthemesLogo,
  imgFooterDefault,
  imgFooterTheme1,
  imgFooterTheme2,
  imgFooterTheme3,
  imgFooterTheme4,
  imgFooterTheme5,
  imgFooterTheme6,
  imgFooterTheme7,
  imgFooterTheme8
};

export const bgMockup = {
  default: bgMockupDefault,
  theme1: bgMockupTheme1,
  theme2: bgMockupTheme2,
  theme3: bgMockupTheme3,
  theme4: bgMockupTheme4,
  theme5: bgMockupTheme5,
  theme6: bgMockupTheme6,
  theme7: bgMockupTheme7,
  theme8: bgMockupTheme8
};

export default {
  imgFeature1,
  imgFeature2,
  imgFeature3,
  imgDemo1,
  imgDemo2,
  imgDemo3,
  techCI,
  techAngular,
  techBootstrap,
  techDotnet,
  techVue,
  techCIDark,
  techAngularDark,
  techBootstrapDark,
  techDotnetDark,
  techVueDark,
  imgHeaderTech,
  figmaDefault,
  imgElementMsg,
  imgElementWidget,
  imgElementMainDefault,
  imgBgScreen,
  codedthemesLogo,
  clients,
  dynamic,
  footer,
  bgMockup
};

// also export named symbols for direct imports used across the codebase
export {
  imgFeature1,
  imgFeature2,
  imgFeature3,
  imgDemo1,
  imgDemo2,
  imgDemo3,
  techCI,
  techAngular,
  techBootstrap,
  techDotnet,
  techVue,
  techCIDark,
  techAngularDark,
  techBootstrapDark,
  techDotnetDark,
  techVueDark,
  imgHeaderTech,
  figmaDefault,
  imgElementMsg,
  imgElementWidget,
  imgElementMainDefault,
  imgBgScreen,
  codedthemesLogo,
  imgFooterDefault,
  imgFooterTheme1,
  imgFooterTheme2,
  imgFooterTheme3,
  imgFooterTheme4,
  imgFooterTheme5,
  imgFooterTheme6,
  imgFooterTheme7,
  imgFooterTheme8,
  bgMockupDefault,
  bgMockupTheme1,
  bgMockupTheme2,
  bgMockupTheme3,
  bgMockupTheme4,
  bgMockupTheme5,
  bgMockupTheme6,
  bgMockupTheme7,
  bgMockupTheme8
};