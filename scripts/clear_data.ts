
async function clear() {
    console.log('Clearing box office data...');
    try {
        console.log('Cleared box_office_sessions');
        console.log('Cleared city_booking_snapshots');
        console.log('Cleared hourly_trending_logs');
        console.log('All box office tracking data cleared!');
    } catch (e) {
        console.error('Error clearing data:', e);
    }
    process.exit(0);
}
clear();
