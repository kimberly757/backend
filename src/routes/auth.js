const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const usuariosController = require('../controllers/usuarios.controller');
const { validateZod } = require('../middlewares/validateZod');
const { requireAuth } = require('../middlewares/authMiddleware');
const {
  loginSchema,
  registerSchema,
  passwordRecoverSchema,
  passwordResetSchema,
  changePasswordSchema,
  updateProfileSchema,
} = require('../validators/domainSchemas');

/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: Autenticación, registro, perfil y gestión de contraseña
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrar un nuevo usuario
 *     description: Crea una nueva cuenta de usuario. La contraseña se almacena hasheada. Retorna un JWT válido inmediatamente.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rolusr_id, usuari_nm, usuari_ap, usuari_cd, usuari_co]
 *             properties:
 *               rolusr_id:
 *                 type: integer
 *                 example: 1
 *               usuari_nm:
 *                 type: string
 *                 maxLength: 30
 *                 example: "Juan"
 *               usuari_ap:
 *                 type: string
 *                 maxLength: 30
 *                 example: "Pérez"
 *               usuari_cd:
 *                 type: string
 *                 maxLength: 8
 *                 example: "jperez01"
 *               usuari_co:
 *                 type: string
 *                 minLength: 6
 *                 example: "mi_contraseña"
 *               usuari_em:
 *                 type: string
 *                 format: email
 *                 example: "juan@ejemplo.com"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente. Retorna token JWT y datos del usuario.
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Código de usuario o email ya en uso
 */
router.post('/register', validateZod({ body: registerSchema }), authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión
 *     description: Autentica un usuario con su código y contraseña. Retorna un JWT de 24h.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [usuari_cd, usuari_co]
 *             properties:
 *               usuari_cd:
 *                 type: string
 *                 maxLength: 8
 *                 example: "admin01"
 *               usuari_co:
 *                 type: string
 *                 example: "mi_contraseña"
 *     responses:
 *       200:
 *         description: Login exitoso — retorna token JWT y datos del usuario (sin contraseña)
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Credenciales incorrectas
 *       403:
 *         description: Usuario inactivo
 */
router.post('/login', validateZod({ body: loginSchema }), usuariosController.login);

/**
 * @openapi
 * /auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Obtener perfil del usuario autenticado
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Datos del perfil (sin contraseña)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   put:
 *     tags: [Auth]
 *     summary: Actualizar perfil del usuario autenticado
 *     security: [{ bearerAuth: [] }]
 *     description: Solo permite actualizar nombre (usuari_nm), apellido (usuari_ap) y correo (usuari_em).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuari_nm:
 *                 type: string
 *                 maxLength: 30
 *               usuari_ap:
 *                 type: string
 *                 maxLength: 30
 *               usuari_em:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/profile', requireAuth, authController.getProfile);
router.put('/profile', requireAuth, validateZod({ body: updateProfileSchema }), authController.updateProfile);

/**
 * @openapi
 * /auth/change-password:
 *   put:
 *     tags: [Auth]
 *     summary: Cambiar contraseña del usuario autenticado
 *     security: [{ bearerAuth: [] }]
 *     description: Requiere la contraseña actual para confirmar la identidad antes de cambiarla.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Contraseña actual
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: Nueva contraseña
 *     responses:
 *       200:
 *         description: Contraseña cambiada correctamente
 *       401:
 *         description: Token inválido o contraseña actual incorrecta
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.put('/change-password', requireAuth, validateZod({ body: changePasswordSchema }), authController.changePassword);

/**
 * @openapi
 * /auth/recover:
 *   post:
 *     tags: [Auth]
 *     summary: Solicitar recuperación de contraseña
 *     description: Genera un token temporal de recuperación y lo envía al email registrado del usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@ejemplo.com"
 *     responses:
 *       200:
 *         description: Respuesta genérica (no revela si el usuario existe)
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/recover', validateZod({ body: passwordRecoverSchema }), authController.recover);

/**
 * @openapi
 * /auth/reset:
 *   post:
 *     tags: [Auth]
 *     summary: Restablecer contraseña con token de recuperación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token obtenido del enlace de recuperación
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Contraseña restablecida correctamente
 *       400:
 *         description: Token inválido
 *       401:
 *         description: Token expirado
 */
router.post('/reset', validateZod({ body: passwordResetSchema }), authController.reset);

module.exports = router;
