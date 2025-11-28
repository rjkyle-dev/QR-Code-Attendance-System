import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
    page: {
        backgroundColor: '#fff',
        color: '#262626',
        fontFamily: 'Helvetica',
        fontSize: 12,
        paddingTop: 30,
        paddingBottom: 30,
        paddingLeft: 50,
        paddingRight: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
    },
    textBold: {
        fontFamily: 'Helvetica-Bold',
    },
});
