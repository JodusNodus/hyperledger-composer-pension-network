'use strict';

const getTokenAmount = (contributionAmount) => {
    const baseTokenAmount = 100;
    return baseTokenAmount + contributionAmount / 10000;
}

/**
 * @param {com.thomasbilliet.pension.SubmitContribution} tx
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

/**
 * @param {com.thomasbilliet.pension.TransferBenefits} tx
 * @transaction
 */
async function processTransferTransaction(tx) {
    const {
        sender,
        recipient,
        amount,
    } = tx;

    sender.balance -= amount;
    recipient.balance += amount;

    const factory = getFactory();
    const sendHistoryItem = factory.newConcept('com.thomasbilliet.pension', 'BenefitHistoryItem');
    sendHistoryItem.amount = amount;
    sendHistoryItem.type = 'SEND';
    sender.history.push(sendHistoryItem);

    const receiveHistoryItem = factory.newConcept('com.thomasbilliet.pension', 'BenefitHistoryItem');
    receiveHistoryItem.amount = amount;
    receiveHistoryItem.type = 'RECEIVE';
    recipient.history.push(receiveHistoryItem);

    const assetRegistry = await getAssetRegistry('com.thomasbilliet.pension.CitizenBenefits');
    await assetRegistry.update(sender);
    await assetRegistry.update(recipient);
}

/**
 * @param {com.thomasbilliet.pension.UpdateGoverningBody} tx
 * @transaction
 */
async function processUpdateGoverningBodyTransaction(tx) {
    const {
        citizenBenefits,
        governingBody,
    } = tx;

    citizenBenefits.governingBody = governingBody

    const assetRegistry = await getAssetRegistry('com.thomasbilliet.pension.CitizenBenefits');
    await assetRegistry.update(citizenBenefits);
}

/**
 * @param {com.thomasbilliet.pension.UpdateStatus} tx
 * @transaction
 */
async function processUpdateStatusTransaction(tx) {
    const {
        citizen,
        citizenBenefits,
        employmentStatus,
    } = tx;

    citizen.employmentStatus = employmentStatus

    const assetRegistry = await getParticipantRegistry('com.thomasbilliet.pension.Citizen');
    await assetRegistry.update(citizen);
}

/**
 * @param {com.thomasbilliet.pension.UpdateExchangeRate} tx
 * @transaction
 */
async function processUpdateExchangeRateTransaction(tx) {
    const {
        governingBody,
        benefitExchangeRate,
    } = tx;

    governingBody.benefitExchangeRate = benefitExchangeRate

    const assetRegistry = await getParticipantRegistry('com.thomasbilliet.pension.GoverningBody');
    await assetRegistry.update(governingBody);
}