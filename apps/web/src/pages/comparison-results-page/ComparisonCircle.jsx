import React from 'react';
import VotedCard from '../comparison-aspect-page/ComparisonItemCard/VotedCard';

const ComparisonCircle = ({ item, winner, runnerUp, totalVotes, userVotedAll }) => (
  <VotedCard
    item={item}
    userVotedAll={userVotedAll}
    totalVotes={totalVotes}
    winner={winner}
    runnerUp={runnerUp}
  />
);

export default ComparisonCircle;
