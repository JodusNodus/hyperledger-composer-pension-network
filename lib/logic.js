'use strict';

const getTokenAmount = (contributionAmount) => {
    const baseTokenAmount = 100;
    return baseTokenAmount + contributionAmount / 10000;
}

/**
 * Calculate benefit tokens from contribution and add them to the store
 * @param {com.thomasbilliet.pension.SubmitContribution} sampleTransaction
 * @transaction
 */
async function processContributionTransaction(tx) {
    const {
        issuer,
        recipient,
        amount,
        year
    } = tx;

    const tokenAmount = getTokenAmount(amount);
    recipient.balance += tokenAmount;

    const factory = getFactory();
    const historyItem = factory.newConcept('com.thomasbilliet.pension', 'BenefitHistoryItem');
    historyItem.amount = tokenAmount;
    historyItem.type = 'MINT';
    historyItem.contributionAmount = amount;
    historyItem.contributionYear = year;

    recipient.history.push(historyItem);

    const assetRegistry = await getAssetRegistry('com.thomasbilliet.pension.CitizenBenefits');
    await assetRegistry.update(recipient);
}