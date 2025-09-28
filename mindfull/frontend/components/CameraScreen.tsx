import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import useCameraFlip from './hooks/useCameraFlip';
import { colors } from '../theme';

type Props = {
	onCapture: (photo: { uri: string; width?: number; height?: number; base64?: string }) => void;
	onClose: () => void;
	saveToGallery?: boolean;
};

export default function CameraScreen({ onCapture, onClose, saveToGallery = false }: Props) {
	const [permission, requestPermission] = useCameraPermissions();
	const cameraRef = useRef<CameraView>(null);
	const { cameraType, toggleCameraType } = useCameraFlip();
	const [isCapturing, setIsCapturing] = useState(false);

	const canAskAgain = permission?.canAskAgain ?? true;
	const granted = permission?.granted ?? false;

	const handleRequest = async () => {
		await requestPermission();
	};

	const handleCapture = async () => {
		if (!cameraRef.current || isCapturing) return;
		try {
			setIsCapturing(true);
			const takePicture = (cameraRef.current as unknown as { takePictureAsync?: (opts?: any) => Promise<any> }).takePictureAsync;
			const photo = await takePicture?.({ quality: 0.8, skipProcessing: true });
			if (photo?.uri) {
				if (saveToGallery) {
					try {
						const { status } = await MediaLibrary.requestPermissionsAsync();
						if (status === 'granted') {
							await MediaLibrary.saveToLibraryAsync(photo.uri);
						}
					} catch {}
				}
				onCapture(photo);
			}
		} finally {
			setIsCapturing(false);
		}
	};

	if (!permission) {
		return (
			<View style={styles.permissionContainer}>
				<ActivityIndicator color={colors.text} />
				<Text style={styles.permissionText}>Checking camera permission…</Text>
			</View>
		);
	}

	if (!granted) {
		return (
			<View style={styles.permissionContainer}>
				<Text style={[styles.permissionTitle, { marginBottom: 6 }]}>Camera access needed</Text>
				<Text style={[styles.permissionText, { textAlign: 'center' }]}>We need camera access to scan your medication.</Text>
				<View style={{ height: 12 }} />
				{canAskAgain ? (
					<TouchableOpacity style={styles.btnPrimary} onPress={handleRequest}>
						<Text style={styles.btnPrimaryText}>Allow Camera</Text>
					</TouchableOpacity>
				) : (
					<TouchableOpacity style={styles.btnPrimary} onPress={() => Linking.openSettings()}>
						<Text style={styles.btnPrimaryText}>Open Settings</Text>
					</TouchableOpacity>
				)}
				<TouchableOpacity style={[styles.btnGhost, { marginTop: 8 }]} onPress={onClose}>
					<Text style={styles.btnGhostText}>Cancel</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.cameraWrapper}>
				<CameraView ref={cameraRef} style={styles.camera} facing={cameraType as CameraType} enableTorch={false} />
				<View style={styles.controls}>
					<TouchableOpacity style={styles.smallBtn} onPress={toggleCameraType}>
						<Text style={styles.smallBtnText}>Flip</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.captureBtn, isCapturing && { opacity: 0.7 }]} onPress={handleCapture} disabled={isCapturing}>
						<Text style={styles.captureBtnText}>{isCapturing ? 'Capturing…' : 'Capture'}</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.smallBtn} onPress={onClose}>
						<Text style={styles.smallBtnText}>Close</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { width: '100%' },
	cameraWrapper: { position: 'relative', width: '100%', height: 300, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' },
	camera: { flex: 1 },
	controls: {
		position: 'absolute',
		bottom: 10,
		left: 10,
		right: 10,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	smallBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)' },
	smallBtnText: { color: 'white', fontWeight: '600' },
	captureBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, backgroundColor: colors.text },
	captureBtnText: { color: 'white', fontWeight: '700' },
	permissionContainer: { alignItems: 'center', justifyContent: 'center', padding: 16 },
	permissionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
	permissionText: { color: colors.muted, marginTop: 4 },
	btnPrimary: { backgroundColor: colors.text, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
	btnPrimaryText: { color: 'white', fontWeight: '600' },
	btnGhost: { borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
	btnGhostText: { color: colors.text },
});
